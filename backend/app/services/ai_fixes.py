"""
AI Fix Generator — Uses Claude API to generate copy-paste fix code
for failed audit checks based on the actual page content.
"""

import os
import json

from anthropic import AsyncAnthropic


async def generate_fixes(url: str, html: str, failed_checks: list[dict]) -> list[dict]:
    """Generate fix code for failed checks using Claude AI."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return []

    client = AsyncAnthropic(api_key=api_key)

    # Truncate HTML to avoid token limits (keep head + first 2000 chars of body)
    head_end = html.find("</head>")
    if head_end > 0:
        truncated_html = html[: head_end + 7] + "\n<!-- body truncated -->"
    else:
        truncated_html = html[:3000]

    check_ids = [c["id"] for c in failed_checks]
    check_descriptions = "\n".join(
        f"- {c['id']}: {c['name']} — {c['description']}"
        for c in failed_checks
    )

    prompt = f"""You are a web SEO expert. A website at {url} has the following issues from an automated audit.

For each failed check below, generate the exact fix code the user should add to their website.

## Failed checks:
{check_descriptions}

## Current HTML <head>:
```html
{truncated_html}
```

## Instructions:
For each failed check, return a JSON object with:
- "id": the check ID (must match exactly)
- "fix_code": the exact HTML/XML/text code to add or replace (ready to copy-paste)
- "fix_explanation": a 1-2 sentence plain-English explanation of what this fix does and why it matters
- "fix_location": where to put the code (e.g., "Inside <head> tag", "Root folder as sitemap.xml")

For meta descriptions and OG descriptions: write them based on the actual page content. Make them compelling, 120-160 characters, and include relevant keywords.

For JSON-LD: generate an Organization schema with the business name and URL extracted from the page.

For sitemaps: generate a complete sitemap.xml with the URL and today's date as lastmod.

Return ONLY a JSON array of fix objects. No markdown, no explanation outside the JSON."""

    response = await client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )

    # Parse the response
    text = response.content[0].text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3].strip()

    try:
        fixes = json.loads(text)
        if isinstance(fixes, list):
            return [f for f in fixes if isinstance(f, dict) and f.get("id") in check_ids]
    except json.JSONDecodeError:
        pass

    return []
