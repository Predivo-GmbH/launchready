import { NextRequest, NextResponse } from 'next/server'
import { runAudit } from '@/lib/audit-engine'

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
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
