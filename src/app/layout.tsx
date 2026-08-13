import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { Shield, Zap } from 'lucide-react'
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
  // Derive the Supabase preconnect from the build-time env so staging preconnects
  // to the staging project rather than a hardcoded prod host.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return (
    <html lang="en">
      <head>
        {supabaseUrl && <link rel="dns-prefetch" href={supabaseUrl} />}
        {supabaseUrl && <link rel="preconnect" href={supabaseUrl} />}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <noscript>
          <style>{`body{visibility:visible}`}</style>
        </noscript>
      </head>
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa', backgroundColor: '#09090b' }}>
            LaunchReady requires JavaScript to run. Please enable JavaScript in your browser settings.
          </div>
        </noscript>
        <PasswordGate>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Link href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
              Skip to content
            </Link>
            <Header />

            <main id="main-content" className="flex-1 min-w-0">{children}</main>

            <footer className="border-t border-zinc-800">
              <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1.6fr_1fr]">
                  {/* Brand */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" aria-hidden="true" />
                      <span className="text-base font-extrabold tracking-[-0.02em] text-white">LaunchReady</span>
                    </div>
                    <p className="max-w-xs text-xs leading-relaxed text-zinc-400">Post-launch website audits with copy-paste AI fix code — in 60 seconds.</p>
                    <p className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <Shield className="h-3 w-3 shrink-0" aria-hidden="true" />
                      Swiss-made
                    </p>
                  </div>

                  {/* Product */}
                  <nav aria-label="Product" className="flex flex-col gap-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</h3>
                    <ul className="flex flex-col gap-3">
                      <li><Link href="/pricing" className="text-sm text-zinc-400 transition-colors hover:text-white">Pricing</Link></li>
                    </ul>
                  </nav>
                </div>

                <div className="my-8 border-t border-zinc-800" />

                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-xs text-zinc-400">© {new Date().getFullYear()} LaunchReady by Predivo GmbH. All rights reserved.</p>
                  <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                    <Link href="/privacy" className="text-xs text-zinc-400 transition-colors hover:text-white">Privacy</Link>
                    <Link href="/terms" className="text-xs text-zinc-400 transition-colors hover:text-white">Terms</Link>
                    <Link href="/impressum" className="text-xs text-zinc-400 transition-colors hover:text-white">Impressum</Link>
                  </nav>
                </div>
              </div>
            </footer>
          </div>
        </PasswordGate>
      </body>
    </html>
  )
}
