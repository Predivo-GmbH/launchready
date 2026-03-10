import { Check, X } from 'lucide-react'

const features = [
  { name: 'Per-page meta tag audit', launchready: true, lighthouse: false, semrush: true },
  { name: 'Copy-paste fix code', launchready: true, lighthouse: false, semrush: false },
  { name: 'AI-generated descriptions', launchready: true, lighthouse: false, semrush: false },
  { name: 'Sitemap generation', launchready: true, lighthouse: false, semrush: false },
  { name: 'JSON-LD schema generation', launchready: true, lighthouse: false, semrush: false },
  { name: 'Lighthouse scores', launchready: true, lighthouse: true, semrush: true },
  { name: 'Guided Search Console setup', launchready: true, lighthouse: false, semrush: false },
  { name: 'Social sharing preview', launchready: true, lighthouse: false, semrush: true },
  { name: 'No signup required', launchready: true, lighthouse: true, semrush: false },
  { name: 'Under $20/month', launchready: true, lighthouse: true, semrush: false },
]

export function Comparison() {
  return (
    <section className="py-20 px-4 border-t border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          Why not just use Lighthouse or Semrush?
        </h2>
        <p className="text-zinc-400 text-center text-sm mb-10">
          They report problems. We generate the fixes.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 text-zinc-500 font-medium"></th>
                <th className="py-3 text-blue-400 font-semibold">LaunchReady</th>
                <th className="py-3 text-zinc-400 font-medium">Lighthouse</th>
                <th className="py-3 text-zinc-400 font-medium">Semrush</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  <td className="py-3 text-zinc-300">{f.name}</td>
                  <Cell value={f.launchready} highlight />
                  <Cell value={f.lighthouse} />
                  <Cell value={f.semrush} />
                </tr>
              ))}
              <tr>
                <td className="py-3 text-zinc-300 font-medium">Price</td>
                <td className="py-3 text-center text-blue-400 font-semibold">$9</td>
                <td className="py-3 text-center text-zinc-400">Free</td>
                <td className="py-3 text-center text-zinc-400">$140/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Cell({ value, highlight }: { value: boolean; highlight?: boolean }) {
  return (
    <td className="py-3 text-center">
      {value ? (
        <Check className={`w-4 h-4 mx-auto ${highlight ? 'text-blue-400' : 'text-green-500'}`} />
      ) : (
        <X className="w-4 h-4 mx-auto text-zinc-600" />
      )}
    </td>
  )
}
