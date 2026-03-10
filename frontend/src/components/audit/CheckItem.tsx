import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { AuditCheck } from '../../types/audit'
import { CopyButton } from '../ui/CopyButton'

const statusConfig = {
  pass: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  fail: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  skip: { icon: MinusCircle, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
}

interface CheckItemProps {
  check: AuditCheck
}

export function CheckItem({ check }: CheckItemProps) {
  const [expanded, setExpanded] = useState(check.status === 'fail')
  const { icon: Icon, color, bg } = statusConfig[check.status]
  const hasFix = check.fix_code || check.fix_explanation

  return (
    <div className={`rounded-lg border border-zinc-800 ${bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <Icon className={`w-5 h-5 shrink-0 ${color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{check.name}</p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">{check.description}</p>
        </div>
        {(hasFix || check.details) && (
          expanded
            ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
      </button>

      {expanded && (hasFix || check.details) && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800">
          {check.details && (
            <p className="text-sm text-zinc-300 mt-3">{check.details}</p>
          )}

          {check.fix_explanation && (
            <div className="mt-3">
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">How to fix</p>
              <p className="text-sm text-zinc-300">{check.fix_explanation}</p>
            </div>
          )}

          {check.fix_location && (
            <p className="text-xs text-zinc-500">
              Where: <span className="text-zinc-400 font-mono">{check.fix_location}</span>
            </p>
          )}

          {check.fix_code && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-green-400 uppercase tracking-wide">Copy-paste fix</p>
                <CopyButton text={check.fix_code} />
              </div>
              <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed border border-zinc-800">
                <code>{check.fix_code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
