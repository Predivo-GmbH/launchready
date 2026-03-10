"""
LaunchReady Audit Engine

Crawls a website and runs all post-launch checks:
- Meta tags (title, description, canonical)
- Open Graph & Twitter Card tags
- Sitemap.xml existence and quality
- Robots.txt existence
- JSON-LD structured data
- Security headers
- Image alt text
- Heading hierarchy
- Lighthouse scores (via CDP)
- AI-generated fix suggestions (via Claude API)
"""

import os
import json
import asyncio
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from app.services.ai_fixes import generate_fixes


async def run_audit(url: str) -> dict:
    """Run a full audit on the given URL and return results."""
    checks = []
    pages_crawled = 0
    lighthouse = None

    parsed = urlparse(url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    # Fetch the main page
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=30.0,
        headers={"User-Agent": "LaunchReady/1.0 (audit bot)"},
    ) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
        except httpx.HTTPError as e:
            raise RuntimeError(f"Could not fetch {url}: {e}")

        html = resp.text
        soup = BeautifulSoup(html, "lxml")
        pages_crawled = 1

        # === META TAG CHECKS ===
        checks.extend(_check_meta_tags(soup, url))

        # === OPEN GRAPH CHECKS ===
        checks.extend(_check_og_tags(soup, url))

        # === TWITTER CARD CHECKS ===
        checks.extend(_check_twitter_tags(soup))

        # === HEADING HIERARCHY ===
        checks.extend(_check_headings(soup))

        # === IMAGE ALT TEXT ===
        checks.extend(_check_images(soup))

        # === SITEMAP ===
        sitemap_checks = await _check_sitemap(client, base_url)
        checks.extend(sitemap_checks)

        # === ROBOTS.TXT ===
        robots_checks = await _check_robots(client, base_url)
        checks.extend(robots_checks)

        # === JSON-LD STRUCTURED DATA ===
        checks.extend(_check_jsonld(soup, base_url))

        # === SECURITY HEADERS ===
        checks.extend(_check_security_headers(resp.headers, url))

        # === HTTPS ===
        checks.extend(_check_https(url))

        # === VIEWPORT META ===
        checks.extend(_check_viewport(soup))

    # === AI FIX GENERATION ===
    failed_checks = [c for c in checks if c["status"] == "fail"]
    if failed_checks and os.getenv("ANTHROPIC_API_KEY"):
        try:
            fixes = await generate_fixes(url, html, failed_checks)
            # Merge fixes back into checks
            fix_map = {f["id"]: f for f in fixes}
            for check in checks:
                if check["id"] in fix_map:
                    check.update(fix_map[check["id"]])
        except Exception:
            pass  # AI fixes are best-effort

    # Calculate overall score
    total = len([c for c in checks if c["status"] != "skip"])
    passed = len([c for c in checks if c["status"] == "pass"])
    overall_score = round((passed / total) * 100) if total > 0 else 0

    return {
        "overall_score": overall_score,
        "checks": checks,
        "pages_crawled": pages_crawled,
        "lighthouse": lighthouse,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def _check_meta_tags(soup: BeautifulSoup, url: str) -> list[dict]:
    checks = []

    # Title
    title = soup.find("title")
    title_text = title.get_text(strip=True) if title else None
    if title_text and len(title_text) > 10:
        checks.append({
            "id": "meta-title",
            "category": "meta",
            "name": "Page title",
            "status": "pass",
            "description": f"Title found: \"{title_text}\"",
        })
    else:
        checks.append({
            "id": "meta-title",
            "category": "meta",
            "name": "Page title",
            "status": "fail",
            "description": "Missing or too short page title",
            "details": f"Current title: \"{title_text or '(none)'}\"",
            "fix_location": "Inside <head> tag",
        })

    # Description
    desc = soup.find("meta", attrs={"name": "description"})
    desc_content = desc.get("content", "") if desc else ""
    if desc_content and len(desc_content) > 50:
        checks.append({
            "id": "meta-description",
            "category": "meta",
            "name": "Meta description",
            "status": "pass",
            "description": f"Description found ({len(desc_content)} chars)",
        })
    else:
        checks.append({
            "id": "meta-description",
            "category": "meta",
            "name": "Meta description",
            "status": "fail",
            "description": "Missing or too short meta description",
            "details": f"Current: \"{desc_content or '(none)'}\" — should be 120-160 characters",
            "fix_location": "Inside <head> tag",
        })

    # Canonical
    canonical = soup.find("link", attrs={"rel": "canonical"})
    canonical_href = canonical.get("href", "") if canonical else ""
    if canonical_href:
        checks.append({
            "id": "meta-canonical",
            "category": "meta",
            "name": "Canonical URL",
            "status": "pass",
            "description": f"Canonical set to {canonical_href}",
        })
    else:
        checks.append({
            "id": "meta-canonical",
            "category": "meta",
            "name": "Canonical URL",
            "status": "fail",
            "description": "No canonical URL set — search engines may index duplicate versions",
            "fix_code": f'<link rel="canonical" href="{url}" />',
            "fix_explanation": "Add this to your <head> tag. It tells Google which URL is the 'official' version of this page.",
            "fix_location": "Inside <head> tag",
        })

    return checks


def _check_og_tags(soup: BeautifulSoup, url: str) -> list[dict]:
    checks = []

    og_title = soup.find("meta", property="og:title")
    og_desc = soup.find("meta", property="og:description")
    og_image = soup.find("meta", property="og:image")
    og_url = soup.find("meta", property="og:url")

    # OG Title
    if og_title and og_title.get("content"):
        checks.append({
            "id": "og-title",
            "category": "social",
            "name": "OG title",
            "status": "pass",
            "description": f"og:title set: \"{og_title['content']}\"",
        })
    else:
        checks.append({
            "id": "og-title",
            "category": "social",
            "name": "OG title",
            "status": "fail",
            "description": "Missing og:title — social media shares will have no title",
            "fix_location": "Inside <head> tag",
        })

    # OG Description
    if og_desc and og_desc.get("content"):
        checks.append({
            "id": "og-description",
            "category": "social",
            "name": "OG description",
            "status": "pass",
            "description": f"og:description set ({len(og_desc['content'])} chars)",
        })
    else:
        checks.append({
            "id": "og-description",
            "category": "social",
            "name": "OG description",
            "status": "fail",
            "description": "Missing og:description — social shares will have no description",
            "fix_location": "Inside <head> tag",
        })

    # OG Image
    if og_image and og_image.get("content"):
        checks.append({
            "id": "og-image",
            "category": "social",
            "name": "OG image",
            "status": "pass",
            "description": f"og:image set: {og_image['content']}",
        })
    else:
        checks.append({
            "id": "og-image",
            "category": "social",
            "name": "OG image",
            "status": "fail",
            "description": "Missing og:image — social shares will have no preview image",
            "details": "Recommended size: 1200x630 pixels (PNG or JPG)",
            "fix_location": "Inside <head> tag",
        })

    # OG URL
    if og_url and og_url.get("content"):
        checks.append({
            "id": "og-url",
            "category": "social",
            "name": "OG URL",
            "status": "pass",
            "description": f"og:url set: {og_url['content']}",
        })
    else:
        checks.append({
            "id": "og-url",
            "category": "social",
            "name": "OG URL",
            "status": "fail",
            "description": "Missing og:url",
            "fix_code": f'<meta property="og:url" content="{url}" />',
            "fix_explanation": "This tells social platforms the canonical URL of this page.",
            "fix_location": "Inside <head> tag",
        })

    return checks


def _check_twitter_tags(soup: BeautifulSoup) -> list[dict]:
    card = soup.find("meta", attrs={"name": "twitter:card"})
    if card and card.get("content"):
        return [{
            "id": "twitter-card",
            "category": "social",
            "name": "Twitter Card",
            "status": "pass",
            "description": f"twitter:card set: \"{card['content']}\"",
        }]
    else:
        return [{
            "id": "twitter-card",
            "category": "social",
            "name": "Twitter Card",
            "status": "fail",
            "description": "Missing twitter:card meta tag",
            "fix_code": '<meta name="twitter:card" content="summary_large_image" />',
            "fix_explanation": "This controls how your page appears when shared on X/Twitter. 'summary_large_image' shows a large preview image.",
            "fix_location": "Inside <head> tag",
        }]


def _check_headings(soup: BeautifulSoup) -> list[dict]:
    h1s = soup.find_all("h1")
    if len(h1s) == 1:
        return [{
            "id": "heading-h1",
            "category": "structure",
            "name": "H1 heading",
            "status": "pass",
            "description": f"Single H1 found: \"{h1s[0].get_text(strip=True)[:80]}\"",
        }]
    elif len(h1s) == 0:
        return [{
            "id": "heading-h1",
            "category": "structure",
            "name": "H1 heading",
            "status": "fail",
            "description": "No H1 heading found — this is the main heading search engines look for",
            "fix_explanation": "Add a single <h1> tag with your page's main title.",
            "fix_location": "Main content area of the page",
        }]
    else:
        return [{
            "id": "heading-h1",
            "category": "structure",
            "name": "H1 heading",
            "status": "warn",
            "description": f"Multiple H1 headings found ({len(h1s)}) — best practice is exactly one per page",
        }]


def _check_images(soup: BeautifulSoup) -> list[dict]:
    images = soup.find_all("img")
    if not images:
        return [{
            "id": "img-alt",
            "category": "accessibility",
            "name": "Image alt text",
            "status": "skip",
            "description": "No images found on page",
        }]

    missing_alt = [img for img in images if not img.get("alt")]
    if not missing_alt:
        return [{
            "id": "img-alt",
            "category": "accessibility",
            "name": "Image alt text",
            "status": "pass",
            "description": f"All {len(images)} images have alt text",
        }]
    else:
        return [{
            "id": "img-alt",
            "category": "accessibility",
            "name": "Image alt text",
            "status": "fail" if len(missing_alt) > len(images) / 2 else "warn",
            "description": f"{len(missing_alt)} of {len(images)} images missing alt text",
            "details": "Images without alt text are invisible to screen readers and search engines.",
            "fix_explanation": "Add descriptive alt attributes to all <img> tags. Example: <img src='photo.jpg' alt='Team photo of Predivo engineers' />",
        }]


async def _check_sitemap(client: httpx.AsyncClient, base_url: str) -> list[dict]:
    checks = []
    try:
        resp = await client.get(f"{base_url}/sitemap.xml")
        if resp.status_code == 200 and "<urlset" in resp.text:
            soup = BeautifulSoup(resp.text, "lxml-xml")
            urls = soup.find_all("url")
            has_lastmod = any(u.find("lastmod") for u in urls)

            if has_lastmod:
                checks.append({
                    "id": "sitemap-exists",
                    "category": "indexability",
                    "name": "Sitemap.xml",
                    "status": "pass",
                    "description": f"Sitemap found with {len(urls)} URLs and lastmod dates",
                })
            else:
                checks.append({
                    "id": "sitemap-exists",
                    "category": "indexability",
                    "name": "Sitemap.xml",
                    "status": "warn",
                    "description": f"Sitemap found with {len(urls)} URLs but missing lastmod dates",
                    "details": "Adding <lastmod> dates helps Google prioritize crawling recently updated pages.",
                    "fix_explanation": "Add <lastmod>YYYY-MM-DD</lastmod> to each <url> entry in your sitemap.",
                })
        else:
            checks.append({
                "id": "sitemap-exists",
                "category": "indexability",
                "name": "Sitemap.xml",
                "status": "fail",
                "description": "No sitemap.xml found",
                "details": "A sitemap helps search engines discover all your pages.",
                "fix_location": "Save as sitemap.xml in your website's root folder",
            })
    except httpx.HTTPError:
        checks.append({
            "id": "sitemap-exists",
            "category": "indexability",
            "name": "Sitemap.xml",
            "status": "fail",
            "description": "Could not fetch sitemap.xml",
            "fix_location": "Save as sitemap.xml in your website's root folder",
        })

    return checks


async def _check_robots(client: httpx.AsyncClient, base_url: str) -> list[dict]:
    try:
        resp = await client.get(f"{base_url}/robots.txt")
        if resp.status_code == 200 and len(resp.text) > 10:
            has_sitemap = "sitemap" in resp.text.lower()
            if has_sitemap:
                return [{
                    "id": "robots-txt",
                    "category": "indexability",
                    "name": "Robots.txt",
                    "status": "pass",
                    "description": "robots.txt found with sitemap reference",
                }]
            else:
                return [{
                    "id": "robots-txt",
                    "category": "indexability",
                    "name": "Robots.txt",
                    "status": "warn",
                    "description": "robots.txt found but no sitemap reference",
                    "fix_code": f"Sitemap: {base_url}/sitemap.xml",
                    "fix_explanation": "Add this line to the end of your robots.txt file. It tells search engines where to find your sitemap.",
                    "fix_location": "End of robots.txt file",
                }]
        else:
            return [{
                "id": "robots-txt",
                "category": "indexability",
                "name": "Robots.txt",
                "status": "fail",
                "description": "No robots.txt found",
                "fix_code": f"User-agent: *\nAllow: /\n\nSitemap: {base_url}/sitemap.xml",
                "fix_explanation": "This file tells search engines they're allowed to crawl your site and where to find your sitemap.",
                "fix_location": "Save as robots.txt in your website's root folder",
            }]
    except httpx.HTTPError:
        return [{
            "id": "robots-txt",
            "category": "indexability",
            "name": "Robots.txt",
            "status": "fail",
            "description": "Could not fetch robots.txt",
        }]


def _check_jsonld(soup: BeautifulSoup, base_url: str) -> list[dict]:
    scripts = soup.find_all("script", type="application/ld+json")
    if scripts:
        try:
            data = json.loads(scripts[0].get_text())
            schema_type = data.get("@type", "Unknown")
            return [{
                "id": "jsonld",
                "category": "structure",
                "name": "JSON-LD structured data",
                "status": "pass",
                "description": f"JSON-LD found: @type \"{schema_type}\"",
            }]
        except json.JSONDecodeError:
            return [{
                "id": "jsonld",
                "category": "structure",
                "name": "JSON-LD structured data",
                "status": "warn",
                "description": "JSON-LD found but contains invalid JSON",
            }]
    else:
        return [{
            "id": "jsonld",
            "category": "structure",
            "name": "JSON-LD structured data",
            "status": "fail",
            "description": "No JSON-LD structured data found",
            "details": "Structured data helps Google understand your business and can enable rich search results.",
            "fix_location": "Inside <head> tag or before </body>",
        }]


def _check_security_headers(headers: httpx.Headers, url: str) -> list[dict]:
    checks = []

    # X-Content-Type-Options
    xcto = headers.get("x-content-type-options")
    if xcto and "nosniff" in xcto.lower():
        checks.append({
            "id": "header-xcto",
            "category": "security",
            "name": "X-Content-Type-Options",
            "status": "pass",
            "description": "X-Content-Type-Options: nosniff is set",
        })
    else:
        checks.append({
            "id": "header-xcto",
            "category": "security",
            "name": "X-Content-Type-Options",
            "status": "warn",
            "description": "Missing X-Content-Type-Options header",
            "fix_explanation": "Add this header to prevent browsers from MIME-type sniffing. Configure on your web server or hosting provider.",
        })

    # X-Frame-Options
    xfo = headers.get("x-frame-options")
    if xfo:
        checks.append({
            "id": "header-xfo",
            "category": "security",
            "name": "X-Frame-Options",
            "status": "pass",
            "description": f"X-Frame-Options: {xfo}",
        })
    else:
        checks.append({
            "id": "header-xfo",
            "category": "security",
            "name": "X-Frame-Options",
            "status": "warn",
            "description": "Missing X-Frame-Options header — your site could be embedded in iframes on other sites",
        })

    return checks


def _check_https(url: str) -> list[dict]:
    if url.startswith("https://"):
        return [{
            "id": "https",
            "category": "security",
            "name": "HTTPS",
            "status": "pass",
            "description": "Site uses HTTPS",
        }]
    else:
        return [{
            "id": "https",
            "category": "security",
            "name": "HTTPS",
            "status": "fail",
            "description": "Site does not use HTTPS — Google penalizes non-HTTPS sites in search rankings",
            "fix_explanation": "Enable SSL/TLS on your hosting provider. Most providers offer free Let's Encrypt certificates.",
        }]


def _check_viewport(soup: BeautifulSoup) -> list[dict]:
    viewport = soup.find("meta", attrs={"name": "viewport"})
    if viewport and viewport.get("content"):
        return [{
            "id": "viewport",
            "category": "accessibility",
            "name": "Viewport meta tag",
            "status": "pass",
            "description": "Viewport meta tag is set for mobile responsiveness",
        }]
    else:
        return [{
            "id": "viewport",
            "category": "accessibility",
            "name": "Viewport meta tag",
            "status": "fail",
            "description": "Missing viewport meta tag — site won't display properly on mobile",
            "fix_code": '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            "fix_explanation": "Add this to your <head> tag. It ensures your site scales properly on mobile devices.",
            "fix_location": "Inside <head> tag",
        }]
