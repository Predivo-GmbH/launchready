import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum — LaunchReady',
  description: 'Legal information and company details for LaunchReady by Predivo GmbH, based in Küssnacht am Rigi, Switzerland. Commercial register and contact details.',
  openGraph: {
    title: 'Impressum — LaunchReady',
    description: 'Legal information and company details for LaunchReady by Predivo GmbH.',
  },
}

export default function Impressum() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Impressum</h1>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">Company</h2>
            <p>
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi<br />
              Switzerland
            </p>
            <p className="mt-2">Limited Liability Company (GmbH)</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Authorized Representative</h2>
            <p>Roger Müller, Managing Director</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">UID</h2>
            <p>CHE-374.611.592</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Commercial Register</h2>
            <p>Canton of Schwyz, CH-130-4036622-2 (EHRA-ID: 1738984)</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Contact</h2>
            <p>Email: <a href="mailto:hello@predivo.ch" className="text-blue-400 hover:text-blue-300">hello@predivo.ch</a></p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Disclaimer</h2>
            <p>
              The content of this website has been prepared with the greatest possible care.
              However, Predivo GmbH does not guarantee the accuracy, completeness, or timeliness
              of the content provided. Liability claims relating to material or immaterial damages
              caused by the use or non-use of the information provided are excluded in principle.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Copyright</h2>
            <p>
              The content and works published on this website are subject to Swiss copyright law.
              Any use outside the limits of copyright law requires prior written consent from Predivo GmbH.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">Links</h2>
            <p>
              This website may contain links to third-party websites. Predivo GmbH has no influence
              on their content and assumes no responsibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
