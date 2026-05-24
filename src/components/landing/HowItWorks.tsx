import { Globe, Search, Code, Rocket } from 'lucide-react'

const steps = [
  { icon: Globe, title: 'Paste your URL', desc: 'Any website — React, WordPress, Wix, Squarespace, static HTML.' },
  { icon: Search, title: 'We audit everything', desc: 'All metadata, OG data, sitemap, robots.txt, structured data, security headers.' },
  { icon: Code, title: 'Get copy-paste fixes', desc: 'Exact code for every issue — meta tags, JSON-LD, sitemap XML.' },
  { icon: Rocket, title: 'Get found on Google', desc: 'Guided steps for Search Console, Business Profile, social verification.' },
]

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-20 px-4 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8 sm:mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 flex items-center justify-center"><s.icon className="w-6 h-6 text-blue-400" aria-hidden="true" /></div>
              <h3 className="text-sm font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
