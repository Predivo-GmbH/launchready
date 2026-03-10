import type { Metadata } from 'next'
import { Zap } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaunchReady — Post-Launch Website Audit with AI Fix Code',
  description: 'Paste your URL, get a full post-launch SEO audit with copy-paste fix code — in 60 seconds. Free, no signup required.',
  openGraph: {
    title: 'LaunchReady — Post-Launch Website Audit',
    description: 'Your website is live. Google doesn\'t know it exists. Fix that in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 text-white font-bold text-lg">
                <Zap className="w-5 h-5 text-blue-500" />
                LaunchReady
              </a>
              <nav className="flex items-center gap-4">
                <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How it works</a>
                <a href="#audit" className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">Free Audit</a>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-zinc-800 py-8 px-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm"><Zap className="w-4 h-4" />LaunchReady — Built by Predivo GmbH</div>
              <p className="text-xs text-zinc-600">Powered by Cheerio + Claude AI</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
