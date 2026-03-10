import { Loader2 } from 'lucide-react'

interface AuditProgressProps {
  url: string
  checksComplete?: number
}

export function AuditProgress({ url, checksComplete }: AuditProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-6 py-12">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Auditing your website...</h2>
        <p className="text-zinc-400 text-sm">{url}</p>
      </div>
      <div className="space-y-2">
        <ProgressStep label="Crawling pages" done={(checksComplete ?? 0) > 0} />
        <ProgressStep label="Checking meta tags & OG data" done={(checksComplete ?? 0) > 3} />
        <ProgressStep label="Analyzing sitemap & robots.txt" done={(checksComplete ?? 0) > 6} />
        <ProgressStep label="Running Lighthouse audit" done={(checksComplete ?? 0) > 10} />
        <ProgressStep label="Generating AI fix suggestions" done={false} />
      </div>
    </div>
  )
}

function ProgressStep({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-green-500" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
      )}
      <span className={`text-sm ${done ? 'text-zinc-300' : 'text-zinc-500'}`}>{label}</span>
    </div>
  )
}
