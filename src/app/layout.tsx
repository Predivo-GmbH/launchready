import type { Metadata } from 'next'
import { Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PasswordGate } from '@/components/shared/PasswordGate'
import './globals.css'

export const metadata: Metadata = {
  title: 'LaunchReady — Post-Launch Website Audit with AI Fix Code',
  description: 'Paste your URL, get a full post-launch SEO audit with copy-paste fix code — in 60 seconds. Free, no signup required.',
  openGraph: {
    title: 'LaunchReady — Post-Launch Website Audit',
    description: 'Your website is live. Google doesn\'t know it exists. Fix that in 60 seconds.',
    type: 'website',
    url: 'https://launchready.predivo.ch',
    images: [{ url: 'https://launchready.predivo.ch/og-image.png', width: 1200, height: 630, alt: 'LaunchReady — Post-Launch Website Audit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchReady — Post-Launch Website Audit with AI Fix Code',
    description: 'Paste your URL, get a full post-launch SEO audit with copy-paste fix code — in 60 seconds.',
    images: ['https://launchready.predivo.ch/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-950 text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <PasswordGate>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
              Skip to content
            </a>
            <Header />

            <main id="main-content" className="flex-1">{children}</main>

            <footer className="border-t border-zinc-800 py-8 px-4">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-500 text-sm"><Zap className="w-4 h-4" />LaunchReady — Built by Predivo GmbH</div>
                <nav aria-label="Footer navigation" className="flex items-center gap-4 text-xs text-zinc-500">
                  <a href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
                  <a href="/impressum" className="hover:text-zinc-300 transition-colors">Impressum</a>
                  <a href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</a>
                  <a href="/terms" className="hover:text-zinc-300 transition-colors">Terms</a>
                </nav>
              </div>
            </footer>
          </div>
        </PasswordGate>
      </body>
    </html>
  )
}
