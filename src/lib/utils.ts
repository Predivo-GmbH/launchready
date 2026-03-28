import type { AuditCheck } from '@/lib/types'

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 70) return 'text-yellow-500'
  if (score >= 50) return 'text-orange-500'
  return 'text-red-500'
}

export function scoreRingColor(score: number): string {
  if (score >= 90) return 'text-green-500 stroke-green-500'
  if (score >= 70) return 'text-yellow-500 stroke-yellow-500'
  if (score >= 50) return 'text-orange-500 stroke-orange-500'
  return 'text-red-500 stroke-red-500'
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    meta: 'Meta Tags',
    social: 'Social Sharing',
    indexability: 'Indexability',
    performance: 'Performance',
    accessibility: 'Accessibility',
    security: 'Security',
    structure: 'Site Structure',
  }
  return labels[cat] || cat
}

/** Count checks by status */
export function countByStatus(checks: AuditCheck[]) {
  let pass = 0, fail = 0, warn = 0
  for (const c of checks) {
    if (c.status === 'pass') pass++
    else if (c.status === 'fail') fail++
    else if (c.status === 'warn') warn++
  }
  return { pass, fail, warn }
}

/** Score color as RGB tuple for PDF generation */
export function scoreRgb(score: number): [number, number, number] {
  if (score >= 90) return [34, 197, 94]
  if (score >= 70) return [234, 179, 8]
  if (score >= 50) return [249, 115, 22]
  return [239, 68, 68]
}

/** Fetch with abort-timeout helper. Returns the Response. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 60000,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

/** Build auth headers for Supabase edge function calls */
export async function buildAuthHeaders(): Promise<Record<string, string>> {
  const { supabase } = await import('@/lib/supabase')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}
