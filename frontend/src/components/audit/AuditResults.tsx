import { useMemo } from 'react'
import type { AuditResult, CheckCategory } from '../../types/audit'
import { ScoreRing } from '../ui/ScoreRing'
import { CheckItem } from './CheckItem'
import { categoryLabel } from '../../lib/utils'
import { FileCode, ExternalLink } from 'lucide-react'

interface AuditResultsProps {
  audit: AuditResult
}

const categoryOrder: CheckCategory[] = [
  'meta',
  'social',
  'indexability',
  'structure',
  'performance',
  'accessibility',
  'security',
]

export function AuditResults({ audit }: AuditResultsProps) {
  const grouped = useMemo(() => {
    const groups: Partial<Record<CheckCategory, typeof audit.checks>> = {}
    for (const check of audit.checks) {
      if (!groups[check.category]) groups[check.category] = []
      groups[check.category]!.push(check)
    }
    return groups
  }, [audit.checks])

  const failCount = audit.checks.filter(c => c.status === 'fail').length
  const warnCount = audit.checks.filter(c => c.status === 'warn').length
  const passCount = audit.checks.filter(c => c.status === 'pass').length

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing score={audit.overall_score} size={140} />

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">Audit Complete</h2>
            <p className="text-zinc-400 text-sm mb-4">
              <a href={audit.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 inline-flex items-center gap-1">
                {audit.url} <ExternalLink className="w-3 h-3" />
              </a>
              <span className="mx-2">·</span>
              {audit.pages_crawled} page{audit.pages_crawled !== 1 ? 's' : ''} crawled
            </p>

            <div className="flex gap-6 justify-center sm:justify-start">
              <Stat value={passCount} label="Passed" color="text-green-500" />
              <Stat value={warnCount} label="Warnings" color="text-yellow-500" />
              <Stat value={failCount} label="Failed" color="text-red-500" />
            </div>
          </div>
        </div>

        {/* Lighthouse scores */}
        {audit.lighthouse && (
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-4">Lighthouse Scores</p>
            <div className="flex justify-center gap-6">
              <ScoreRing score={audit.lighthouse.performance} size={80} label="Perf" />
              <ScoreRing score={audit.lighthouse.accessibility} size={80} label="A11y" />
              <ScoreRing score={audit.lighthouse.bestPractices} size={80} label="BP" />
              <ScoreRing score={audit.lighthouse.seo} size={80} label="SEO" />
            </div>
          </div>
        )}
      </div>

      {/* Checks by category */}
      {categoryOrder.map(cat => {
        const checks = grouped[cat]
        if (!checks?.length) return null
        const catFails = checks.filter(c => c.status === 'fail').length

        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <FileCode className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                {categoryLabel(cat)}
              </h3>
              {catFails > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                  {catFails} issue{catFails !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {checks.map(check => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        )
      })}

      {/* Guided Actions */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h3 className="text-lg font-bold text-white mb-4">Next Steps (Manual)</h3>
        <p className="text-sm text-zinc-400 mb-6">
          These tasks require manual action but are critical for getting found on Google.
        </p>
        <div className="space-y-4">
          <GuidedStep
            step={1}
            title="Set up Google Search Console"
            description="Verify your domain ownership and submit your sitemap so Google discovers all your pages."
            link="https://search.google.com/search-console"
          />
          <GuidedStep
            step={2}
            title="Create Google Business Profile"
            description="Claim your business listing so it appears in Google Maps and local search results."
            link="https://business.google.com"
          />
          <GuidedStep
            step={3}
            title="Request Indexing"
            description="In Search Console, use URL Inspection to request indexing for each page."
          />
          <GuidedStep
            step={4}
            title="Test Social Sharing"
            description="Verify your site's preview card looks correct when shared on social media."
            link="https://developers.facebook.com/tools/debug/"
            linkLabel="Facebook Debugger"
          />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  )
}

function GuidedStep({ step, title, description, link, linkLabel }: {
  step: number
  title: string
  description: string
  link?: string
  linkLabel?: string
}) {
  return (
    <div className="flex gap-4 p-4 rounded-lg bg-zinc-800/50">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
        {step}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-400 mt-1">{description}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
          >
            {linkLabel || 'Open'} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}
