'use client'

import { useEffect, useState } from 'react'
import { Clock, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/lib/plans'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { AuthModal } from '@/components/auth/AuthModal'
import { MonitoredSites } from '@/components/monitoring/MonitoredSites'

interface AuditRow {
  id: string
  url: string
  overall_score: number
  pages_crawled: number
  created_at: string
  is_monitoring?: boolean
}

export default function Dashboard() {
  const { user, plan, loading } = useAuth()
  const [audits, setAudits] = useState<AuditRow[]>([])
  const [fetching, setFetching] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setFetching(false)
      return
    }

    supabase
      .from('audits')
      .select('id, url, overall_score, pages_crawled, created_at, is_monitoring')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setAudits(data ?? [])
        setFetching(false)
      })
  }, [user, loading])

  if (loading || fetching) {
    return (
      <div className="py-24 text-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="py-24 px-4 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">My Audits</h1>
          <p className="text-zinc-400">Log in to see your audit history.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Log in
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      </>
    )
  }

  const limits = PLAN_LIMITS[plan]
  const manualAudits = audits.filter(a => !a.is_monitoring)
  const monitoringAudits = audits.filter(a => a.is_monitoring)

  // Group monitoring audits by URL for score trends
  const latestByUrl = new Map<string, AuditRow[]>()
  for (const a of monitoringAudits) {
    const list = latestByUrl.get(a.url) || []
    list.push(a)
    latestByUrl.set(a.url, list)
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Monitoring section */}
        {limits.monitoring && (
          <MonitoredSites plan={plan} />
        )}

        {/* Upgrade banner for non-pro users */}
        {!limits.monitoring && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">Automated Monitoring</h3>
              <p className="text-xs text-zinc-400">Track up to 5 sites with weekly re-audits and score change alerts.</p>
            </div>
            <a href="/pricing" className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shrink-0">
              Upgrade to Pro
            </a>
          </div>
        )}

        {/* Manual audits */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">My Audits</h1>
            <a href="/" className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">New Audit</a>
          </div>

          {manualAudits.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-zinc-400">No audits yet. Run your first audit!</p>
              <a href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">Run Audit</a>
            </div>
          ) : (
            <div className="space-y-3">
              {manualAudits.map(a => (
                <AuditCard key={a.id} audit={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AuditCard({ audit, prevScore }: { audit: AuditRow; prevScore?: number }) {
  const scoreDiff = prevScore != null ? audit.overall_score - prevScore : null
  const TrendIcon = scoreDiff != null
    ? scoreDiff > 0 ? TrendingUp
    : scoreDiff < 0 ? TrendingDown
    : Minus
    : null

  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
      <ScoreRing score={audit.overall_score} size={48} />
      <div className="flex-1 min-w-0">
        <a href={audit.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-blue-400 flex items-center gap-1 truncate">
          {audit.url} <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
          <Clock className="w-3 h-3" />
          {new Date(audit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          <span>&middot;</span>
          {audit.pages_crawled} page{audit.pages_crawled !== 1 ? 's' : ''}
          {audit.is_monitoring && (
            <>
              <span>&middot;</span>
              <span className="text-blue-400">monitoring</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        {TrendIcon && scoreDiff != null && (
          <TrendIcon className={`w-4 h-4 ${scoreDiff > 0 ? 'text-green-500' : scoreDiff < 0 ? 'text-red-500' : 'text-zinc-500'}`} />
        )}
        <div>
          <span className="text-2xl font-bold text-white">{audit.overall_score}</span>
          <span className="text-xs text-zinc-500">/100</span>
        </div>
      </div>
    </div>
  )
}
