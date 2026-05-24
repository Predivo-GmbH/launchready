'use client'

import { useState, useTransition } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import type { AuditResult } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { PLAN_LIMITS } from '@/lib/plans'
import { fetchWithTimeout, buildAuthHeaders } from '@/lib/utils'
import { AuditResults } from './AuditResults'

export function AuditForm() {
  const { user, plan } = useAuth()
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    try {
      const parsed = new URL(normalized)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setError('Please enter a valid URL')
        return
      }
    } catch {
      setError('Please enter a valid URL (e.g., example.com)')
      return
    }

    setError(null)
    setResult(null)

    startTransition(async () => {
      try {
        // Check audit limit for free users
        const limits = PLAN_LIMITS[plan]
        if (user && limits.auditsPerMonth > 0) {
          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)

          const { count } = await supabase
            .from('audits')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString())

          if ((count ?? 0) >= limits.auditsPerMonth) {
            setError(`Free plan limit reached (${limits.auditsPerMonth} audit/month). Upgrade for unlimited audits.`)
            return
          }
        }

        // Pass auth token if logged in so the audit gets saved
        const headers = await buildAuthHeaders()
        const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-audit`
        const resp = await fetchWithTimeout(edgeFnUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: trimmed }),
        })
        const data = await resp.json()
        if (!resp.ok) throw new Error(data.error || 'Audit failed')
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Audit failed')
      }
    })
  }

  if (result) {
    return (
      <div className="py-6 sm:py-12 px-4" aria-live="polite" aria-label="Audit results">
        <div className="max-w-4xl mx-auto mb-8">
          <button onClick={() => { setResult(null); setUrl('') }} className="text-sm text-zinc-400 hover:text-white transition-colors min-h-[44px] inline-flex items-center">&larr; New audit</button>
        </div>
        <AuditResults audit={result} plan={plan} />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" aria-hidden="true" />
            <input
              type="text"
              inputMode="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your website URL..."
              aria-label="Website URL"
              className="w-full pl-12 pr-4 py-4 min-h-[44px] bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base md:text-lg"
              disabled={pending}
            />
          </div>
          <button type="submit" disabled={pending || !url.trim()} className="px-8 py-4 min-h-[44px] bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0">
            {pending ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /><span role="status" aria-live="polite">Auditing...</span></> : 'Audit'}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto mt-4">
          <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
            {error}
            {error.includes('Upgrade') && (
              <a href="/pricing" className="ml-2 text-blue-400 hover:text-blue-300 underline inline-flex items-center min-h-[44px]">View plans</a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
