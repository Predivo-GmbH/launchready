'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink, Clock, Loader2, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'
import { fetchWithTimeout, buildAuthHeaders } from '@/lib/utils'
import { ScoreRing } from '@/components/ui/ScoreRing'

interface MonitoredSite {
  id: string
  url: string
  active: boolean
  last_score: number | null
  prev_score: number | null
  last_checked_at: string | null
  created_at: string
}

export function MonitoredSites({ plan }: { plan: PlanId }) {
  const limits = PLAN_LIMITS[plan]
  const [sites, setSites] = useState<MonitoredSite[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSites = useCallback(async () => {
    const { data } = await supabase
      .from('monitored_sites')
      .select('*')
      .order('created_at', { ascending: false })
    setSites(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchSites().catch(() => {}) }, [fetchSites])

  async function addSite(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newUrl.trim()
    if (!trimmed) return

    if (sites.length >= limits.maxMonitoredSites) {
      setError(`Pro plan limit: ${limits.maxMonitoredSites} monitored sites. Remove a site to add a new one.`)
      return
    }

    setAdding(true)
    setError(null)

    let normalizedUrl = trimmed
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch {
      setError('Please enter a valid URL (e.g. example.com)')
      setAdding(false)
      return
    }

    // Check duplicate
    if (sites.some(s => s.url === normalizedUrl)) {
      setError('This site is already being monitored.')
      setAdding(false)
      return
    }

    const { error: insertError } = await supabase
      .from('monitored_sites')
      .insert({ url: normalizedUrl })

    if (insertError) {
      setError(insertError.message)
    } else {
      setNewUrl('')
      setShowAdd(false)
      await fetchSites()
    }
    setAdding(false)
  }

  async function removeSite(id: string) {
    const { error: deleteError } = await supabase.from('monitored_sites').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setSites(s => s.filter(site => site.id !== id))
  }

  async function runAuditNow(site: MonitoredSite) {
    setRunningId(site.id)
    setError(null)
    try {
      const headers = await buildAuthHeaders()
      const edgeFnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/run-audit`
      const resp = await fetchWithTimeout(edgeFnUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: site.url, monitoring_site_id: site.id }),
      })

      if (resp.ok) {
        const result = await resp.json()
        // Update the site's last score
        await supabase
          .from('monitored_sites')
          .update({
            prev_score: site.last_score,
            last_score: result.overall_score,
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', site.id)
        await fetchSites()
      } else {
        const data = await resp.json().catch(() => ({}))
        setError(data.error || `Audit failed (HTTP ${resp.status})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed. Please try again.')
    }
    setRunningId(null)
  }

  if (loading) {
    return (
      <div className="animate-pulse text-zinc-400 text-center py-8" role="status" aria-live="polite" aria-label="Loading monitored sites">Loading monitored sites...</div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Monitored Sites</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {sites.length}/{limits.maxMonitoredSites} sites &middot; Re-audited weekly
          </p>
        </div>
        {sites.length < limits.maxMonitoredSites && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 text-sm px-4 py-2 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Site
          </button>
        )}
      </div>

      {/* Add site form */}
      {showAdd && (
        <form onSubmit={addSite} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
            <input
              type="text"
              inputMode="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              aria-label="Site URL to monitor"
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-base"
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newUrl.trim()}
            className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {error && (
        <div role="alert" className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {sites.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400 text-sm mb-4">No monitored sites yet. Add your first site to start tracking.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Your First Site
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map(site => {
            const scoreDiff = site.prev_score != null && site.last_score != null
              ? site.last_score - site.prev_score
              : null
            const TrendIcon = scoreDiff != null
              ? scoreDiff > 0 ? TrendingUp
              : scoreDiff < 0 ? TrendingDown
              : Minus
              : null
            const isRunning = runningId === site.id

            return (
              <div key={site.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {site.last_score != null ? (
                  <ScoreRing score={site.last_score} size={48} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">—</div>
                )}

                <div className="flex-1 min-w-0">
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-blue-400 flex items-center gap-1 truncate">
                    {site.url.replace(/^https?:\/\//, '')} <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {site.last_checked_at
                      ? `Last checked ${new Date(site.last_checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'Never checked'}
                    {TrendIcon && scoreDiff != null && (
                      <>
                        <span>&middot;</span>
                        <span className={`flex items-center gap-0.5 ${scoreDiff > 0 ? 'text-green-500' : scoreDiff < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                          <TrendIcon className="w-4 h-4" aria-hidden="true" />
                          {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runAuditNow(site)}
                    disabled={isRunning}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Run audit now"
                  >
                    {isRunning ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-5 h-5" aria-hidden="true" />}
                  </button>
                  <button
                    onClick={() => removeSite(site.id)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    aria-label="Remove site"
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
