import Anthropic from '@anthropic-ai/sdk'
import type { AuditCheck } from './types'

interface Fix {
  id: string
  fix_code?: string
  fix_explanation?: string
  fix_location?: string
}

export async function generateFixes(
  url: string,
  html: string,
  failedChecks: AuditCheck[],
): Promise<Fix[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return []

  const client = new Anthropic({ apiKey })

  // Keep only <head> to stay within token limits
  const headEnd = html.indexOf('</head>')
  const truncated = headEnd > 0 ? html.slice(0, headEnd + 7) : html.slice(0, 3000)

  const checkList = failedChecks
    .map(c => `- ${c.id}: ${c.name} — ${c.description}`)
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a web SEO expert. A website at ${url} has these issues:

${checkList}

Current HTML <head>:
\`\`\`html
${truncated}
\`\`\`

For each failed check, return a JSON array of objects with:
- "id": check ID (exact match)
- "fix_code": exact HTML/XML to copy-paste
- "fix_explanation": 1-2 sentence plain-English explanation
- "fix_location": where to put it

For descriptions: write based on actual page content, 120-160 chars, include keywords.
For JSON-LD: generate Organization schema from page content.
For sitemaps: generate complete sitemap.xml with today's date.

Return ONLY a JSON array. No markdown fences.`,
      },
    ],
  })

  const text = (response.content[0] as { type: 'text'; text: string }).text.trim()

  // Strip markdown fences if present
  let json = text
  if (json.startsWith('```')) {
    json = json.split('\n').slice(1).join('\n')
    if (json.endsWith('```')) json = json.slice(0, -3).trim()
  }

  try {
    const fixes = JSON.parse(json)
    if (Array.isArray(fixes)) {
      const validIds = new Set(failedChecks.map(c => c.id))
      return fixes.filter((f): f is Fix => typeof f === 'object' && validIds.has(f.id))
    }
  } catch {
    // AI response wasn't valid JSON — acceptable
  }

  return []
}
