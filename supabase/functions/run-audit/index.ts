import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0'

// ─── Types ──────────────────────────────────────────────────

type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip'
type CheckCategory = 'meta' | 'social' | 'indexability' | 'performance' | 'accessibility' | 'security' | 'structure'

interface AuditCheck {
  id: string
  category: CheckCategory
  name: string
  status: CheckStatus
  description: string
  details?: string
  fix_code?: string
  fix_explanation?: string
  fix_location?: string
}

interface Fix {
  id: string
  fix_code?: string
  fix_explanation?: string
  fix_location?: string
}

// ─── Rate Limiting ──────────────────────────────────────────

const ipRateLimit = new Map<string, { windowStart: number; count: number }>()

// ─── CORS ───────────────────────────────────────────────────

const IS_PRODUCTION = Deno.env.get('IS_PRODUCTION') !== 'false'

const ALLOWED_ORIGINS = IS_PRODUCTION
  ? ['https://launchready.predivo.ch']
  : ['https://launchready.predivo.ch', 'http://localhost:3000', 'http://localhost:3001']

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// ─── SSRF Protection ────────────────────────────────────────

function isPrivateUrl(urlStr: string): boolean {
  try {
    const hostname = new URL(urlStr).hostname
    if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname)) return true
    if (hostname.endsWith('.local') || hostname === 'metadata.google.internal') return true
    if (/^10\./.test(hostname)) return true
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
    if (/^192\.168\./.test(hostname)) return true
    if (/^169\.254\./.test(hostname)) return true
    return false
  } catch {
    return true
  }
}

// ─── Handler ────────────────────────────────────────────────

serve(async (req: Request) => {
  const cors = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const body = await req.json()
    const { url, monitoring_site_id, skip_save } = body

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Normalize
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // SSRF protection — block private/internal URLs
    if (isPrivateUrl(normalizedUrl)) {
      return new Response(JSON.stringify({ error: 'URL not allowed: private or internal addresses are blocked' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Determine user and plan for AI fix gating
    const authHeader = req.headers.get('authorization')
    let userId: string | null = null
    let userPlan = 'free'
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required env vars: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
    const db = createClient(supabaseUrl, supabaseServiceKey)

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7)
        const { data: { user } } = await db.auth.getUser(token)
        if (user) {
          userId = user.id
          const { data: planData } = await db
            .from('user_plans')
            .select('plan')
            .eq('user_id', user.id)
            .single()
          userPlan = planData?.plan || 'free'
        }
      } catch (err) {
        console.error('Auth lookup failed:', err instanceof Error ? err.message : err)
      }
    }

    // Server-side audit limit enforcement for free users
    if (userId && userPlan === 'free') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await db
        .from('audits')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

      if ((count ?? 0) >= 1) {
        return new Response(JSON.stringify({ error: 'Free plan limit reached (1 audit/month). Upgrade for unlimited audits.' }), {
          status: 429,
          headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }
    }

    // IP-based rate limiting for anonymous (unauthenticated) requests
    // NOTE: x-forwarded-for can be spoofed by clients. On Supabase Edge Functions,
    // the platform sets this header from the actual connection IP, so it's trustworthy
    // in this deployment context. Authenticated users bypass this (rate-limited by DB count).
    if (!userId) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('x-real-ip')
        || 'unknown'

      if (clientIp !== 'unknown') {
        const now = Date.now()
        const windowMs = 60 * 60 * 1000 // 1 hour
        const maxRequests = 5
        const entry = ipRateLimit.get(clientIp)

        if (entry && now - entry.windowStart < windowMs) {
          if (entry.count >= maxRequests) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later or create a free account.' }), {
              status: 429,
              headers: { ...cors, 'Content-Type': 'application/json' },
            })
          }
          entry.count++
        } else {
          ipRateLimit.set(clientIp, { windowStart: now, count: 1 })
        }

        // Clean up stale entries
        if (ipRateLimit.size > 1000) {
          for (const [ip, e] of ipRateLimit) {
            if (now - e.windowStart >= windowMs) ipRateLimit.delete(ip)
          }
        }
      }
    }

    // Audit log: record API call metadata
    const clientIpForLog = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'
    console.log(JSON.stringify({
      event: 'audit_request',
      url: normalizedUrl,
      user_id: userId,
      plan: userPlan,
      ip: clientIpForLog,
      timestamp: new Date().toISOString(),
    }))

    // Only generate AI fixes for paid users (saves API cost)
    const shouldGenerateFixes = userPlan !== 'free'
    const result = await runAudit(normalizedUrl, shouldGenerateFixes)

    // For free users, strip fix code from the response
    if (userPlan === 'free') {
      for (const check of result.checks) {
        delete check.fix_code
        delete check.fix_explanation
        delete check.fix_location
      }
    }

    // Save to Supabase if user is authenticated (skip_save used by monitoring to avoid duplicates)
    if (userId && !skip_save) {
      try {
        await db.from('audits').insert({
          user_id: userId,
          url: result.url,
          overall_score: result.overall_score,
          checks: result.checks,
          pages_crawled: result.pages_crawled,
          is_monitoring: !!monitoring_site_id,
          monitored_site_id: monitoring_site_id || null,
        })
      } catch (err) {
        console.error('Audit save failed:', err instanceof Error ? err.message : err)
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const cors = getCorsHeaders(req)
    const rawMessage = err instanceof Error ? err.message : 'Audit failed'
    console.error('Audit error:', rawMessage)
    // Sanitize error: only return safe messages to the client
    const safeMessages = ['Timed out', 'Page too large', 'Could not fetch', 'private/internal', 'Invalid URL', 'Audit failed']
    const message = safeMessages.find(m => rawMessage.includes(m)) ? rawMessage : 'Audit failed. Please try again.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})

// ─── Audit Engine ───────────────────────────────────────────

async function runAudit(url: string, shouldGenerateFixes = true) {
  const checks: AuditCheck[] = []
  const parsed = new URL(url)
  const baseUrl = `${parsed.protocol}//${parsed.host}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let resp: Response
  try {
    resp = await fetch(url, {
      headers: { 'User-Agent': 'LaunchReady/1.0 (audit bot)' },
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Timed out fetching ${url} (15s limit)`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }

  if (!resp.ok) {
    throw new Error(`Could not fetch ${url}: ${resp.status} ${resp.statusText}`)
  }

  const html = await resp.text()
  if (html.length > 5_000_000) {
    throw new Error('Page too large to audit (>5MB)')
  }
  const $ = cheerio.load(html)

  checks.push(...checkMetaTags($, url))
  checks.push(...checkOgTags($, url))
  checks.push(...checkTwitterTags($))
  checks.push(...checkHeadings($))
  checks.push(...checkImages($))
  checks.push(...(await checkSitemap(baseUrl)))
  checks.push(...(await checkRobots(baseUrl)))
  checks.push(...checkJsonLd($))
  checks.push(...checkSecurityHeaders(resp.headers, url))
  checks.push(...checkHttps(url))
  checks.push(...checkViewport($))

  // AI Fixes (only for paid users to save API cost)
  const failed = checks.filter(c => c.status === 'fail')
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (shouldGenerateFixes && failed.length > 0 && anthropicKey) {
    try {
      const fixes = await generateFixes(anthropicKey, url, html, failed)
      const fixMap = new Map(fixes.map(f => [f.id, f]))
      for (const check of checks) {
        const fix = fixMap.get(check.id)
        if (fix) Object.assign(check, fix)
      }
    } catch {
      // AI fixes are best-effort
    }
  }

  const scorable = checks.filter(c => c.status !== 'skip')
  const passed = checks.filter(c => c.status === 'pass').length
  const overall_score = scorable.length > 0 ? Math.round((passed / scorable.length) * 100) : 0

  return {
    url,
    overall_score,
    checks,
    pages_crawled: 1,
    created_at: new Date().toISOString(),
  }
}

// ─── AI Fixes ───────────────────────────────────────────────

async function generateFixes(apiKey: string, url: string, html: string, failedChecks: AuditCheck[]): Promise<Fix[]> {
  const headEnd = html.indexOf('</head>')
  const truncated = headEnd > 0 ? html.slice(0, headEnd + 7) : html.slice(0, 3000)

  const checkList = failedChecks.map(c => `- ${c.id}: ${c.name} — ${c.description}`).join('\n')

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a web SEO expert. A website at ${url} has these issues:\n\n${checkList}\n\nCurrent HTML <head>:\n\`\`\`html\n${truncated}\n\`\`\`\n\nFor each failed check, return a JSON array of objects with:\n- "id": check ID (exact match)\n- "fix_code": exact HTML/XML to copy-paste\n- "fix_explanation": 1-2 sentence plain-English explanation\n- "fix_location": where to put it\n\nFor descriptions: write based on actual page content, 120-160 chars, include keywords.\nFor JSON-LD: generate Organization schema from page content.\nFor sitemaps: generate complete sitemap.xml with today's date.\n\nReturn ONLY a JSON array. No markdown fences.`,
      }],
    }),
  })

  if (!resp.ok) return []

  const data = await resp.json()
  const text = data.content?.[0]?.text?.trim() ?? ''

  let json = text
  if (json.startsWith('```')) {
    json = json.split('\n').slice(1).join('\n')
    if (json.endsWith('```')) json = json.slice(0, -3).trim()
  }

  try {
    const fixes = JSON.parse(json)
    if (Array.isArray(fixes)) {
      const validIds = new Set(failedChecks.map(c => c.id))
      return fixes.filter((f: Fix) => typeof f === 'object' && validIds.has(f.id))
    }
  } catch {
    // AI response wasn't valid JSON
  }

  return []
}

// ─── Check Functions ────────────────────────────────────────

function checkMetaTags($: cheerio.CheerioAPI, url: string): AuditCheck[] {
  const checks: AuditCheck[] = []

  const titleEl = $('title')
  const titleText = titleEl.text().trim()
  checks.push(
    titleText.length > 10
      ? { id: 'meta-title', category: 'meta', name: 'Page title', status: 'pass', description: `Title found: "${titleText}"` }
      : { id: 'meta-title', category: 'meta', name: 'Page title', status: 'fail', description: 'Missing or too short page title', details: `Current: "${titleText || '(none)'}"`, fix_location: 'Inside <head> tag' }
  )

  const descContent = $('meta[name="description"]').attr('content') || ''
  checks.push(
    descContent.length > 50
      ? { id: 'meta-description', category: 'meta', name: 'Meta description', status: 'pass', description: `Description found (${descContent.length} chars)` }
      : { id: 'meta-description', category: 'meta', name: 'Meta description', status: 'fail', description: 'Missing or too short meta description', details: `Current: "${descContent || '(none)'}" — should be 120-160 characters`, fix_location: 'Inside <head> tag' }
  )

  const canonicalHref = $('link[rel="canonical"]').attr('href') || ''
  checks.push(
    canonicalHref
      ? { id: 'meta-canonical', category: 'meta', name: 'Canonical URL', status: 'pass', description: `Canonical set to ${canonicalHref}` }
      : { id: 'meta-canonical', category: 'meta', name: 'Canonical URL', status: 'fail', description: 'No canonical URL set — search engines may index duplicate versions', fix_code: `<link rel="canonical" href="${url}" />`, fix_explanation: 'Tells Google which URL is the official version of this page.', fix_location: 'Inside <head> tag' }
  )

  return checks
}

function checkOgTags($: cheerio.CheerioAPI, url: string): AuditCheck[] {
  const checks: AuditCheck[] = []

  const ogTitle = $('meta[property="og:title"]').attr('content')
  checks.push(
    ogTitle
      ? { id: 'og-title', category: 'social', name: 'OG title', status: 'pass', description: `og:title: "${ogTitle}"` }
      : { id: 'og-title', category: 'social', name: 'OG title', status: 'fail', description: 'Missing og:title — social shares will have no title', fix_location: 'Inside <head> tag' }
  )

  const ogDesc = $('meta[property="og:description"]').attr('content')
  checks.push(
    ogDesc
      ? { id: 'og-description', category: 'social', name: 'OG description', status: 'pass', description: `og:description (${ogDesc.length} chars)` }
      : { id: 'og-description', category: 'social', name: 'OG description', status: 'fail', description: 'Missing og:description — social shares will have no description', fix_location: 'Inside <head> tag' }
  )

  const ogImage = $('meta[property="og:image"]').attr('content')
  checks.push(
    ogImage
      ? { id: 'og-image', category: 'social', name: 'OG image', status: 'pass', description: `og:image: ${ogImage}` }
      : { id: 'og-image', category: 'social', name: 'OG image', status: 'fail', description: 'Missing og:image — no preview image on social shares', details: 'Recommended: 1200x630 PNG or JPG', fix_location: 'Inside <head> tag' }
  )

  const ogUrl = $('meta[property="og:url"]').attr('content')
  checks.push(
    ogUrl
      ? { id: 'og-url', category: 'social', name: 'OG URL', status: 'pass', description: `og:url: ${ogUrl}` }
      : { id: 'og-url', category: 'social', name: 'OG URL', status: 'fail', description: 'Missing og:url', fix_code: `<meta property="og:url" content="${url}" />`, fix_explanation: 'Tells social platforms the canonical URL of this page.', fix_location: 'Inside <head> tag' }
  )

  return checks
}

function checkTwitterTags($: cheerio.CheerioAPI): AuditCheck[] {
  const card = $('meta[name="twitter:card"]').attr('content')
  return [
    card
      ? { id: 'twitter-card', category: 'social', name: 'Twitter Card', status: 'pass', description: `twitter:card: "${card}"` }
      : { id: 'twitter-card', category: 'social', name: 'Twitter Card', status: 'fail', description: 'Missing twitter:card meta tag', fix_code: '<meta name="twitter:card" content="summary_large_image" />', fix_explanation: 'Controls how your page appears when shared on X/Twitter.', fix_location: 'Inside <head> tag' },
  ]
}

function checkHeadings($: cheerio.CheerioAPI): AuditCheck[] {
  const h1s = $('h1')
  if (h1s.length === 1) {
    return [{ id: 'heading-h1', category: 'structure', name: 'H1 heading', status: 'pass', description: `H1: "${h1s.first().text().trim().slice(0, 80)}"` }]
  }
  if (h1s.length === 0) {
    return [{ id: 'heading-h1', category: 'structure', name: 'H1 heading', status: 'fail', description: 'No H1 heading — the main heading search engines look for', fix_explanation: 'Add a single <h1> tag with the page\'s main title.', fix_location: 'Main content area' }]
  }
  return [{ id: 'heading-h1', category: 'structure', name: 'H1 heading', status: 'warn', description: `${h1s.length} H1 headings found — best practice is exactly one` }]
}

function checkImages($: cheerio.CheerioAPI): AuditCheck[] {
  const imgs = $('img')
  if (imgs.length === 0) {
    return [{ id: 'img-alt', category: 'accessibility', name: 'Image alt text', status: 'skip', description: 'No images found on page' }]
  }
  const missingAlt = imgs.toArray().filter(el => !$(el).attr('alt'))
  if (missingAlt.length === 0) {
    return [{ id: 'img-alt', category: 'accessibility', name: 'Image alt text', status: 'pass', description: `All ${imgs.length} images have alt text` }]
  }
  return [{
    id: 'img-alt', category: 'accessibility', name: 'Image alt text',
    status: missingAlt.length > imgs.length / 2 ? 'fail' : 'warn',
    description: `${missingAlt.length} of ${imgs.length} images missing alt text`,
    fix_explanation: 'Add descriptive alt attributes to all <img> tags.',
  }]
}

async function checkSitemap(baseUrl: string): Promise<AuditCheck[]> {
  try {
    const resp = await fetch(`${baseUrl}/sitemap.xml`, { headers: { 'User-Agent': 'LaunchReady/1.0' } })
    if (resp.ok) {
      const text = await resp.text()
      if (text.includes('<urlset')) {
        const $ = cheerio.load(text, { xmlMode: true })
        const urls = $('url')
        const hasLastmod = urls.toArray().some(el => $(el).find('lastmod').length > 0)
        return [{
          id: 'sitemap-exists', category: 'indexability', name: 'Sitemap.xml',
          status: hasLastmod ? 'pass' : 'warn',
          description: hasLastmod
            ? `Sitemap: ${urls.length} URLs with lastmod`
            : `Sitemap: ${urls.length} URLs but no lastmod dates`,
          ...(!hasLastmod && { fix_explanation: 'Add <lastmod>YYYY-MM-DD</lastmod> to each <url> for freshness signals.' }),
        }]
      }
    }
    return [{ id: 'sitemap-exists', category: 'indexability', name: 'Sitemap.xml', status: 'fail', description: 'No sitemap.xml found', details: 'A sitemap helps search engines discover all pages.', fix_location: 'Root folder as sitemap.xml' }]
  } catch {
    return [{ id: 'sitemap-exists', category: 'indexability', name: 'Sitemap.xml', status: 'fail', description: 'Could not fetch sitemap.xml' }]
  }
}

async function checkRobots(baseUrl: string): Promise<AuditCheck[]> {
  try {
    const resp = await fetch(`${baseUrl}/robots.txt`, { headers: { 'User-Agent': 'LaunchReady/1.0' } })
    if (resp.ok) {
      const text = await resp.text()
      if (text.length > 10) {
        const hasSitemap = text.toLowerCase().includes('sitemap')
        return [{
          id: 'robots-txt', category: 'indexability', name: 'Robots.txt',
          status: hasSitemap ? 'pass' : 'warn',
          description: hasSitemap ? 'robots.txt with sitemap reference' : 'robots.txt found but no sitemap reference',
          ...(!hasSitemap && {
            fix_code: `Sitemap: ${baseUrl}/sitemap.xml`,
            fix_explanation: 'Add this to the end of your robots.txt.',
            fix_location: 'End of robots.txt',
          }),
        }]
      }
    }
    return [{
      id: 'robots-txt', category: 'indexability', name: 'Robots.txt', status: 'fail',
      description: 'No robots.txt found',
      fix_code: `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml`,
      fix_explanation: 'Tells search engines they can crawl your site and where the sitemap is.',
      fix_location: 'Root folder as robots.txt',
    }]
  } catch {
    return [{ id: 'robots-txt', category: 'indexability', name: 'Robots.txt', status: 'fail', description: 'Could not fetch robots.txt' }]
  }
}

function checkJsonLd($: cheerio.CheerioAPI): AuditCheck[] {
  const scripts = $('script[type="application/ld+json"]')
  if (scripts.length > 0) {
    try {
      const data = JSON.parse(scripts.first().html() || '{}')
      return [{ id: 'jsonld', category: 'structure', name: 'JSON-LD structured data', status: 'pass', description: `JSON-LD: @type "${data['@type'] || 'Unknown'}"` }]
    } catch {
      return [{ id: 'jsonld', category: 'structure', name: 'JSON-LD structured data', status: 'warn', description: 'JSON-LD found but contains invalid JSON' }]
    }
  }
  return [{
    id: 'jsonld', category: 'structure', name: 'JSON-LD structured data', status: 'fail',
    description: 'No structured data — Google can\'t understand your business type',
    details: 'Enables rich search results (business info, logo, contact).',
    fix_location: 'Inside <head> or before </body>',
  }]
}

function checkSecurityHeaders(headers: Headers, _url: string): AuditCheck[] {
  const checks: AuditCheck[] = []

  const xcto = headers.get('x-content-type-options')
  checks.push(
    xcto?.includes('nosniff')
      ? { id: 'header-xcto', category: 'security', name: 'X-Content-Type-Options', status: 'pass', description: 'nosniff header set' }
      : { id: 'header-xcto', category: 'security', name: 'X-Content-Type-Options', status: 'warn', description: 'Missing X-Content-Type-Options header', fix_explanation: 'Add via your web server config to prevent MIME-sniffing.' }
  )

  const xfo = headers.get('x-frame-options')
  checks.push(
    xfo
      ? { id: 'header-xfo', category: 'security', name: 'X-Frame-Options', status: 'pass', description: `X-Frame-Options: ${xfo}` }
      : { id: 'header-xfo', category: 'security', name: 'X-Frame-Options', status: 'warn', description: 'Missing X-Frame-Options — site could be embedded in iframes' }
  )

  return checks
}

function checkHttps(url: string): AuditCheck[] {
  return [
    url.startsWith('https://')
      ? { id: 'https', category: 'security', name: 'HTTPS', status: 'pass', description: 'Site uses HTTPS' }
      : { id: 'https', category: 'security', name: 'HTTPS', status: 'fail', description: 'No HTTPS — Google penalizes non-HTTPS sites', fix_explanation: 'Enable SSL/TLS via your hosting provider (most offer free Let\'s Encrypt).' },
  ]
}

function checkViewport($: cheerio.CheerioAPI): AuditCheck[] {
  const viewport = $('meta[name="viewport"]').attr('content')
  return [
    viewport
      ? { id: 'viewport', category: 'accessibility', name: 'Viewport meta', status: 'pass', description: 'Viewport meta set for mobile' }
      : { id: 'viewport', category: 'accessibility', name: 'Viewport meta', status: 'fail', description: 'Missing viewport — site won\'t render properly on mobile', fix_code: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />', fix_explanation: 'Ensures your site scales on mobile devices.', fix_location: 'Inside <head>' },
  ]
}
