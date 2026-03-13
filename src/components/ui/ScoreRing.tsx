'use client'

import { scoreRingColor, scoreColor } from '@/lib/utils'

export function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const sw = 8
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c

  return (
    <div className="flex flex-col items-center gap-1" role="img" aria-label={`Score: ${score} out of 100${label ? `, ${label}` : ''}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={sw} className="text-zinc-800" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className={`${scoreRingColor(score)} transition-all duration-1000`} />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" className={`${scoreColor(score)} fill-current rotate-90 origin-center`} style={{ fontSize: size * 0.28, fontWeight: 700 }}>{score}</text>
      </svg>
      {label && <span className="text-xs text-zinc-400 font-medium">{label}</span>}
    </div>
  )
}
