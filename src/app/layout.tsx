import type { Metadata } from 'next'
import { Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
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
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          <Header />

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
