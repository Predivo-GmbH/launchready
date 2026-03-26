'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, ExternalLink } from 'lucide-react'
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) console.error('Failed to load audits:', fetchErr.message)
        setAudits(data ?? [])
        setFetching(false)
      })
  }, [user, loading])

  if (loading || fetching) {
    return (
      <div className="py-24 text-center">
        <div className="animate-pulse text-zinc-500" role="status" aria-live="polite">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="py-24 px-4 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
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

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="sr-only">Dashboard</h1>
        {/* Monitoring section */}
        {limits.monitoring && (
          <MonitoredSites plan={plan} />
        )}

        {/* Upgrade banner for non-pro users */}
        {!limits.monitoring && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white mb-1">Automated Monitoring</h2>
              <p className="text-xs text-zinc-400">Track up to 5 sites with weekly re-audits and score change alerts.</p>
            </div>
            <Link href="/pricing" className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shrink-0">
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Manual audits */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Audits</h2>
            <Link href="/" className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">New Audit</Link>
          </div>

          {manualAudits.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-zinc-400">No audits yet. Run your first audit!</p>
              <Link href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">Run Audit</Link>
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

function AuditCard({ audit }: { audit: AuditRow }) {
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
      <div className="text-right">
        <span className="text-2xl font-bold text-white">{audit.overall_score}</span>
        <span className="text-xs text-zinc-500">/100</span>
      </div>
    </div>
  )
}
