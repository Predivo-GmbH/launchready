import { Globe, Search, Code, Rocket } from 'lucide-react'

const steps = [
  {
    icon: Globe,
    title: 'Paste your URL',
    description: 'Enter any website URL. We support React, WordPress, Wix, Squarespace, static sites — anything.',
  },
  {
    icon: Search,
    title: 'We audit everything',
    description: 'Meta tags, OG data, sitemap, robots.txt, structured data, Lighthouse scores, security headers.',
  },
  {
    icon: Code,
    title: 'Get copy-paste fixes',
    description: 'For every issue found, get the exact code to paste — meta tags, JSON-LD, sitemap XML, and more.',
  },
  {
    icon: Rocket,
    title: 'Get found on Google',
    description: 'Follow the guided steps for Search Console, Google Business Profile, and social sharing verification.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
