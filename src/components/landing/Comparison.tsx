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
    <section className="py-20 px-4 border-t border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-4">Why not just use Lighthouse or Semrush?</h2>
        <p className="text-zinc-400 text-center text-sm mb-10">They report problems. We generate the fixes.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800"><th /><th className="py-3 text-blue-400 font-semibold">LaunchReady</th><th className="py-3 text-zinc-400">Lighthouse</th><th className="py-3 text-zinc-400">Semrush</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-3 text-zinc-300">{r.name}</td>
                  <td className="py-3 text-center">{r.lr ? <Check className="w-4 h-4 mx-auto text-blue-400" /> : <X className="w-4 h-4 mx-auto text-zinc-600" />}</td>
                  <td className="py-3 text-center">{r.lh ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-zinc-600" />}</td>
                  <td className="py-3 text-center">{r.sr ? <Check className="w-4 h-4 mx-auto text-green-500" /> : <X className="w-4 h-4 mx-auto text-zinc-600" />}</td>
                </tr>
              ))}
              <tr><td className="py-3 text-zinc-300 font-medium">Price</td><td className="py-3 text-center text-blue-400 font-semibold">From $19/mo</td><td className="py-3 text-center text-zinc-400">Free</td><td className="py-3 text-center text-zinc-400">$140/mo</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
