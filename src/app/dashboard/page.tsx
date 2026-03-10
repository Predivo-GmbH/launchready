'use client'

import { useEffect, useState } from 'react'
import { Clock, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { AuthModal } from '@/components/auth/AuthModal'

interface AuditRow {
  id: string
  url: string
  overall_score: number
  pages_crawled: number
  created_at: string
}

export default function Dashboard() {
  const { user, loading } = useAuth()
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
      .select('id, url, overall_score, pages_crawled, created_at')
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

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Audits</h1>
          <a href="/" className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">New Audit</a>
        </div>

        {audits.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-zinc-400">No audits yet. Run your first audit!</p>
            <a href="/" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">Run Audit</a>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                <ScoreRing score={a.overall_score} size={48} />
                <div className="flex-1 min-w-0">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-blue-400 flex items-center gap-1 truncate">
                    {a.url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    <span>&middot;</span>
                    {a.pages_crawled} page{a.pages_crawled !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{a.overall_score}</span>
                  <span className="text-xs text-zinc-500">/100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
