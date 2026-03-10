import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum — LaunchReady',
  description: 'Legal information and company details for LaunchReady by Predivo GmbH.',
}

export default function Impressum() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Impressum</h1>

        <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-1">Company</h2>
            <p>Predivo GmbH<br />Switzerland</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-1">UID</h2>
            <p>CHE-374.611.592</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-1">Commercial Register</h2>
            <p>CH-130-4036622-2 (EHRA-ID: 1738984)</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-1">Contact</h2>
            <p>Email: info@predivo.ch</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-1">Responsible for content</h2>
            <p>Predivo GmbH</p>
          </div>
        </div>
      </div>
    </section>
  )
}
