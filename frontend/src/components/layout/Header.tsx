import { Zap } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <Zap className="w-5 h-5 text-blue-500" />
          LaunchReady
        </a>
        <nav className="flex items-center gap-4">
          <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
            How it works
          </a>
          <a
            href="#audit"
            className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            Free Audit
          </a>
        </nav>
      </div>
    </header>
  )
}
