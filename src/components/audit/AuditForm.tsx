'use client'

import { useState, useTransition } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import type { AuditResult } from '@/lib/types'
import { AuditResults } from './AuditResults'

export function AuditForm() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    setError(null)
    setResult(null)

    startTransition(async () => {
      try {
        const resp = await fetch('/api/audits/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto mb-8">
          <button onClick={() => { setResult(null); setUrl('') }} className="text-sm text-zinc-400 hover:text-white transition-colors">&larr; New audit</button>
        </div>
        <AuditResults audit={result} />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your website URL..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
              disabled={pending}
            />
          </div>
          <button type="submit" disabled={pending || !url.trim()} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
            {pending ? <><Loader2 className="w-5 h-5 animate-spin" />Auditing...</> : 'Audit'}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto mt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">{error}</div>
        </div>
      )}
    </>
  )
}
