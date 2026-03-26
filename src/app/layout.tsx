import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Zap } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PasswordGate } from '@/components/shared/PasswordGate'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://launchready.predivo.ch'),
  alternates: { canonical: './' },
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
      </head>
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <PasswordGate>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Link href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
              Skip to content
            </Link>
            <Header />

            <main id="main-content" className="flex-1">{children}</main>

            <footer className="border-t border-zinc-800 py-8 px-4">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-zinc-500 text-sm"><Zap className="w-4 h-4" />LaunchReady — Built by Predivo GmbH</div>
                <nav aria-label="Footer navigation" className="flex items-center gap-4 text-xs text-zinc-500">
                  <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
                  <Link href="/impressum" className="hover:text-zinc-300 transition-colors">Impressum</Link>
                  <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
                </nav>
              </div>
            </footer>
          </div>
        </PasswordGate>
      </body>
    </html>
  )
}
