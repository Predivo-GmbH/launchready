'use client'

import { useMemo } from 'react'
import { ExternalLink, FileCode } from 'lucide-react'
import type { AuditResult, CheckCategory } from '@/lib/types'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { CheckItem } from './CheckItem'
import { categoryLabel } from '@/lib/utils'

const order: CheckCategory[] = ['meta', 'social', 'indexability', 'structure', 'performance', 'accessibility', 'security']

export function AuditResults({ audit }: { audit: AuditResult }) {
  const grouped = useMemo(() => {
    const g: Partial<Record<CheckCategory, typeof audit.checks>> = {}
    for (const c of audit.checks) {
      ;(g[c.category] ??= []).push(c)
    }
    return g
  }, [audit.checks])

  const fail = audit.checks.filter(c => c.status === 'fail').length
  const warn = audit.checks.filter(c => c.status === 'warn').length
  const pass = audit.checks.filter(c => c.status === 'pass').length

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Score header */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing score={audit.overall_score} size={140} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">Audit Complete</h2>
            <p className="text-zinc-400 text-sm mb-4">
              <a href={audit.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 inline-flex items-center gap-1">{audit.url} <ExternalLink className="w-3 h-3" /></a>
              <span className="mx-2">&middot;</span>{audit.pages_crawled} page{audit.pages_crawled !== 1 ? 's' : ''} crawled
            </p>
            <div className="flex gap-6 justify-center sm:justify-start">
              <Stat n={pass} label="Passed" color="text-green-500" />
              <Stat n={warn} label="Warnings" color="text-yellow-500" />
              <Stat n={fail} label="Failed" color="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Checks by category */}
      {order.map(cat => {
        const checks = grouped[cat]
        if (!checks?.length) return null
        const f = checks.filter(c => c.status === 'fail').length
        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <FileCode className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">{categoryLabel(cat)}</h3>
              {f > 0 && <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">{f} issue{f !== 1 ? 's' : ''}</span>}
            </div>
            <div className="space-y-2">{checks.map(c => <CheckItem key={c.id} check={c} />)}</div>
          </div>
        )
      })}

      {/* Guided actions */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h3 className="text-lg font-bold text-white mb-4">Next Steps (Manual)</h3>
        <p className="text-sm text-zinc-400 mb-6">Critical for getting found on Google — requires manual action.</p>
        <div className="space-y-4">
          <Step n={1} title="Set up Google Search Console" desc="Verify domain ownership and submit your sitemap." link="https://search.google.com/search-console" />
          <Step n={2} title="Create Google Business Profile" desc="Claim your business listing for Maps and local search." link="https://business.google.com" />
          <Step n={3} title="Request Indexing" desc="In Search Console → URL Inspection → Request Indexing for each page." />
          <Step n={4} title="Test Social Sharing" desc="Verify preview cards look correct on Facebook and LinkedIn." link="https://developers.facebook.com/tools/debug/" label="Facebook Debugger" />
        </div>
      </div>
    </div>
  )
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return <div className="text-center"><p className={`text-2xl font-bold ${color}`}>{n}</p><p className="text-xs text-zinc-500">{label}</p></div>
}

function Step({ n, title, desc, link, label }: { n: number; title: string; desc: string; link?: string; label?: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/50">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{n}</div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-400 mt-1">{desc}</p>
        {link && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2">{label || 'Open'} <ExternalLink className="w-3 h-3" /></a>}
      </div>
    </div>
  )
}
