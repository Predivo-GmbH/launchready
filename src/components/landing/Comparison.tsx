import { Check, X } from 'lucide-react'

const rows = [
  { name: 'Per-page meta tag audit', lr: true, lh: false, sr: true },
  { name: 'Copy-paste fix code', lr: true, lh: false, sr: false },
  { name: 'AI-generated descriptions', lr: true, lh: false, sr: false },
  { name: 'Sitemap generation', lr: true, lh: false, sr: false },
  { name: 'JSON-LD schema generation', lr: true, lh: false, sr: false },
  { name: 'Lighthouse scores', lr: true, lh: true, sr: true },
  { name: 'Guided Search Console setup', lr: true, lh: false, sr: false },
  { name: 'Social sharing preview', lr: true, lh: false, sr: true },
  { name: 'No signup required', lr: true, lh: true, sr: false },
  { name: 'Under $20/month', lr: true, lh: true, sr: false },
]

export function Comparison() {
  return (
    <section className="py-12 sm:py-20 px-4 border-t border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Why not just use Lighthouse or Semrush?</h2>
        <p className="text-zinc-400 text-center text-sm mb-10">They report problems. We generate the fixes.</p>
        <div className="overflow-x-auto -mx-4 px-4" role="region" aria-label="Feature comparison table" tabIndex={0} style={{ maskImage: 'linear-gradient(to right, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent)' }}>
          <table className="w-full min-w-[420px] text-sm">
            <thead><tr className="border-b border-zinc-800"><th scope="col" className="text-left sticky left-0 bg-zinc-950 z-10 border-r border-zinc-800"><span className="sr-only">Feature</span></th><th scope="col" className="py-3 px-2 text-blue-400 font-semibold text-center text-xs sm:text-sm">LaunchReady</th><th scope="col" className="py-3 px-2 text-zinc-400 text-center text-xs sm:text-sm">Ligh&shy;thouse</th><th scope="col" className="py-3 px-2 text-zinc-400 text-center text-xs sm:text-sm">Sem&shy;rush</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-3 pr-2 text-zinc-300 text-xs sm:text-sm sticky left-0 bg-zinc-950 z-10 border-r border-zinc-800">{r.name}</td>
                  <td className="py-3 px-2 text-center">{r.lr ? <><Check className="w-4 h-4 mx-auto text-blue-400" aria-hidden="true" /><span className="sr-only">Yes</span></> : <><X className="w-4 h-4 mx-auto text-zinc-600" aria-hidden="true" /><span className="sr-only">No</span></>}</td>
                  <td className="py-3 px-2 text-center">{r.lh ? <><Check className="w-4 h-4 mx-auto text-green-500" aria-hidden="true" /><span className="sr-only">Yes</span></> : <><X className="w-4 h-4 mx-auto text-zinc-600" aria-hidden="true" /><span className="sr-only">No</span></>}</td>
                  <td className="py-3 px-2 text-center">{r.sr ? <><Check className="w-4 h-4 mx-auto text-green-500" aria-hidden="true" /><span className="sr-only">Yes</span></> : <><X className="w-4 h-4 mx-auto text-zinc-600" aria-hidden="true" /><span className="sr-only">No</span></>}</td>
                </tr>
              ))}
              <tr><td className="py-3 pr-2 text-zinc-300 font-medium text-xs sm:text-sm sticky left-0 bg-zinc-950 z-10 border-r border-zinc-800">Price</td><td className="py-3 px-2 text-center text-blue-400 font-semibold text-xs sm:text-sm">From $19/mo</td><td className="py-3 px-2 text-center text-zinc-400 text-xs sm:text-sm">Free</td><td className="py-3 px-2 text-center text-zinc-400 text-xs sm:text-sm">$140/mo</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
