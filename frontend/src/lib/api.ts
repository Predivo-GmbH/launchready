const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function startAudit(url: string): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/api/audits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start audit' }))
    throw new Error(err.detail || 'Failed to start audit')
  }
  return res.json()
}

export async function getAudit(id: string): Promise<import('../types/audit').AuditResult> {
  const res = await fetch(`${API_URL}/api/audits/${id}`)
  if (!res.ok) {
    throw new Error('Failed to fetch audit')
  }
  return res.json()
}
