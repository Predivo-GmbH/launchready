import { AuditForm } from '@/components/audit/AuditForm'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Comparison } from '@/components/landing/Comparison'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LaunchReady',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Web',
  description: 'Post-launch website audit tool with AI-generated fix code for SEO, meta tags, sitemaps, and more.',
  url: 'https://launchready.predivo.ch',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Starter' },
    { '@type': 'Offer', price: '39', priceCurrency: 'USD', name: 'Pro' },
  ],
  creator: {
    '@type': 'Organization',
    name: 'Predivo GmbH',
    url: 'https://launchready.predivo.ch',
    address: { '@type': 'PostalAddress', addressLocality: 'Küssnacht am Rigi', addressCountry: 'CH' },
  },
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section id="audit" className="py-12 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            Free audit — no signup required
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Your website is live.<br />
            <span className="text-zinc-500">Google doesn&apos;t know it exists.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Paste your URL and get a full post-launch audit with{' '}
            <span className="text-white font-medium">copy-paste fix code</span> — in 60 seconds.
          </p>

          <AuditForm />

          <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-sm text-zinc-500">
            <span>Meta tags</span>
            <span>OG &amp; Twitter cards</span>
            <span>Sitemap &amp; robots.txt</span>
            <span>JSON-LD schema</span>
            <span>Lighthouse scores</span>
            <span>Security headers</span>
          </div>
        </div>
      </section>

      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Comparison />
    </>
  )
}
