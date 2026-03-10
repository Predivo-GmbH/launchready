import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/audit-engine'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Normalize
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL
    try {
      new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const result = await runAudit(normalizedUrl)

    // Save to Supabase if user is authenticated
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const db = createServerClient()
        const token = authHeader.slice(7)
        const { data: { user } } = await db.auth.getUser(token)

        if (user) {
          await db.from('audits').insert({
            user_id: user.id,
            url: result.url,
            overall_score: result.overall_score,
            checks: result.checks,
            pages_crawled: result.pages_crawled,
          })
        }
      } catch {
        // Saving failed — still return the audit result
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
