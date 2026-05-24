'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import type { AuditCheck } from '@/lib/types'
import { CopyButton } from '@/components/ui/CopyButton'

const cfg = {
  pass: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  fail: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  skip: { icon: MinusCircle, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
} as const

export function CheckItem({ check, locked = false }: { check: AuditCheck; locked?: boolean }) {
  const [open, setOpen] = useState(check.status === 'fail')
  const { icon: Icon, color, bg } = cfg[check.status]
  const hasExtra = check.fix_code || check.fix_explanation || check.details

  return (
    <div className={`rounded-lg border border-zinc-800 ${bg} overflow-hidden`}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`check-details-${check.id}`} className="w-full flex items-center gap-3 p-4 min-h-[44px] text-left hover:bg-white/5 transition-colors">
        <Icon className={`w-5 h-5 shrink-0 ${color}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{check.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">{check.description}</p>
        </div>
        {hasExtra && (open ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />)}
      </button>

      {open && hasExtra && (
        <div id={`check-details-${check.id}`} className="px-4 pb-4 space-y-3 border-t border-zinc-800">
          {check.details && <p className="text-sm text-zinc-300 mt-3">{check.details}</p>}

          {locked && (check.fix_code || check.fix_explanation) ? (
            <div className="mt-3 relative">
              {/* Blurred preview */}
              <div className="select-none pointer-events-none blur-sm opacity-50">
                {check.fix_explanation && (
                  <div>
                    <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">How to fix</p>
                    <p className="text-sm text-zinc-300">Upgrade to see the AI-generated explanation and fix code for this issue.</p>
                  </div>
                )}
                {check.fix_code && (
                  <div className="mt-2">
                    <pre className="bg-zinc-950 rounded-lg p-3 sm:p-4 text-xs text-zinc-300 font-mono border border-zinc-800"><code>{'// Fix code hidden — upgrade to reveal'}</code></pre>
                  </div>
                )}
              </div>
              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="/pricing"
                  className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors border border-zinc-700"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  Unlock Fix Code
                </a>
              </div>
            </div>
          ) : (
            <>
              {check.fix_explanation && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">How to fix</p>
                  <p className="text-sm text-zinc-300">{check.fix_explanation}</p>
                </div>
              )}
              {check.fix_location && <p className="text-xs text-zinc-400">Where: <span className="text-zinc-400 font-mono">{check.fix_location}</span></p>}
              {check.fix_code && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-green-400 uppercase tracking-wide">Copy-paste fix</p>
                    <CopyButton text={check.fix_code} />
                  </div>
                  <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed border border-zinc-800" style={{ maskImage: 'linear-gradient(to right, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent)' }}><code>{check.fix_code}</code></pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
