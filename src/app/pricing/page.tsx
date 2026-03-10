import type { Metadata } from 'next'
import { Check, Zap, Shield, BarChart3 } from 'lucide-react'
import { PLANS } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Pricing — LaunchReady',
  description: 'Simple, transparent pricing. Start free, upgrade for AI fix code and automated monitoring.',
}

const tierIcons = {
  free: Zap,
  starter: Shield,
  pro: BarChart3,
} as const

export default function Pricing() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            Start free. Upgrade when you need copy-paste fixes and monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = tierIcons[plan.id]
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlighted ? 'bg-blue-500/20' : 'bg-zinc-800'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-blue-400' : 'text-zinc-400'}`} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="text-zinc-400 text-sm">{plan.priceNote}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.highlighted ? 'text-blue-400' : 'text-zinc-500'
                      }`} />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <a
                    href="/"
                    className="block text-center py-3 px-6 rounded-xl font-semibold transition-colors bg-zinc-800 text-white hover:bg-zinc-700"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    disabled
                    className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-700/50 border-dashed"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center space-y-6">
          <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <Faq
              q="Can I run a free audit without signing up?"
              a="Yes — paste any URL on the homepage and get your score instantly. No signup, no credit card. You'll see your overall score and top issues. Sign up for a paid plan to unlock AI-generated fix code."
            />
            <Faq
              q="How is this different from Google Lighthouse?"
              a="Lighthouse gives you scores and developer-level recommendations. LaunchReady gives you the actual code to paste. We say 'here's your meta description' — not 'document does not have a meta description.'"
            />
            <Faq
              q="Can I cancel anytime?"
              a="Yes. Cancel any time from your dashboard. No contracts, no hidden fees."
            />
            <Faq
              q="What does the Pro monitoring include?"
              a="We re-audit your sites weekly and track score changes over time. If your score drops (e.g., a deploy removes your sitemap), you'll see it immediately in your dashboard."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h4 className="text-sm font-semibold text-white mb-2">{q}</h4>
      <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
    </div>
  )
}
