import { scoreRingColor } from '../../lib/utils'

interface ScoreRingProps {
  score: number
  size?: number
  label?: string
}

export function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${scoreRingColor(score)} transition-all duration-1000 ease-out`}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={`${scoreRingColor(score)} fill-current rotate-90 origin-center`}
          style={{ fontSize: size * 0.28, fontWeight: 700 }}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
      )}
    </div>
  )
}
