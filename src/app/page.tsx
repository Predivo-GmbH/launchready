import { AuditForm } from '@/components/audit/AuditForm'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Comparison } from '@/components/landing/Comparison'

export default function Home() {
  return (
    <>
      <section id="audit" className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            Free audit — no signup required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Your website is live.<br />
            <span className="text-zinc-500">Google doesn&apos;t know it exists.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Paste your URL and get a full post-launch audit with{' '}
            <span className="text-white font-medium">copy-paste fix code</span> — in 60 seconds.
          </p>

          <AuditForm />

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-zinc-500">
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
