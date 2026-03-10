import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Zap className="w-4 h-4" />
          LaunchReady — Built by Predivo GmbH
        </div>
        <p className="text-xs text-zinc-600">
          Audit engine powered by Playwright + Lighthouse + Claude AI
        </p>
      </div>
    </footer>
  )
}
