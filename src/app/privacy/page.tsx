import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LaunchReady',
  description: 'Privacy policy for LaunchReady by Predivo GmbH. Learn how we collect, process, and protect your data in compliance with Swiss DSG and EU GDPR regulations.',
  openGraph: {
    title: 'Privacy Policy — LaunchReady',
    description: 'How we collect, process, and protect your data. Swiss DSG and EU GDPR compliant.',
    images: [{ url: 'https://launchready.predivo.ch/og-image.png', width: 1200, height: 630, alt: 'LaunchReady — Post-Launch Website Audit' }],
  },
}

export default function Privacy() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-400">Last updated: March 10, 2026</p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">1. Responsible Party</h2>
            <p>
              Predivo GmbH<br />
              Bahnhofstrasse 55<br />
              6403 Küssnacht am Rigi<br />
              Switzerland<br />
              <a href="mailto:hello@predivo.ch" className="text-blue-400 hover:text-blue-300">hello@predivo.ch</a>
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">2. General</h2>
            <p>
              This privacy policy explains what personal data we collect in connection with the
              LaunchReady website and service, and for what purpose we process it. The Swiss Federal
              Act on Data Protection (DSG/FADP) applies, as well as the European General Data
              Protection Regulation (GDPR) where applicable.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">3. Data We Collect</h2>
            <p className="mb-2"><strong className="text-zinc-300">Server log files:</strong> When visiting this website, the following data is automatically stored: IP address (anonymized), date and time of access, page/URL accessed, referrer URL, browser and operating system used. This data is used exclusively for the technical provision of the website and to ensure system security. The retention period is 14 days.</p>
            <p className="mb-2"><strong className="text-zinc-300">Account data:</strong> When you create an account, we collect your email address and an encrypted password.</p>
            <p className="mb-2"><strong className="text-zinc-300">Audit data:</strong> URLs you submit for auditing, audit results, scores, and generated fix code.</p>
            <p><strong className="text-zinc-300">Usage data:</strong> Feature usage and interaction data to improve the service.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">4. Purpose of Processing</h2>
            <p>
              We process your data to provide the LaunchReady audit service, manage your account,
              enforce usage limits, and improve our product. We do not sell your data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">5. Data Storage &amp; Hosting</h2>
            <p className="mb-2">
              This website is hosted by Metanet AG, Zurich, Switzerland (<a href="https://metanet.ch" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">metanet.ch</a>).
              The servers are located in Switzerland.
            </p>
            <p>
              Application data (accounts, audits) is stored on Supabase, hosted in the EU (Ireland).
              Data is retained as long as your account is active. You can request deletion at any time.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">6. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-zinc-300">Supabase</strong> (EU) — authentication and database hosting</li>
              <li><strong className="text-zinc-300">Anthropic, Claude AI</strong> (USA) — generating fix code and audit explanations for paid users. Data transfer is based on EU Standard Contractual Clauses.</li>
              <li><strong className="text-zinc-300">Google PageSpeed Insights API</strong> (USA) — retrieving performance and accessibility scores. Data transfer is based on EU Standard Contractual Clauses.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">7. Cookies</h2>
            <p>
              We use essential cookies only for authentication (session management). No tracking,
              analytics, or advertising cookies are used. No cookie consent banner is required
              because we only use technically necessary cookies.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">8. Your Rights (DSG / GDPR)</h2>
            <p>
              You have the right to access, rectify, delete, and restrict the processing of your
              personal data. You also have the right to withdraw any consent given at any time.
              To exercise your rights, contact us at:{' '}
              <a href="mailto:hello@predivo.ch" className="text-blue-400 hover:text-blue-300">hello@predivo.ch</a>
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">9. Data Deletion</h2>
            <p>
              You can delete your account and all associated data at any time by contacting us.
              Upon account deletion, all personal data, audit results, and monitored sites are
              permanently removed within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">10. Changes</h2>
            <p>
              We reserve the right to amend this privacy policy at any time. The current version
              is published on this website. We encourage you to review this page periodically.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">11. Contact</h2>
            <p>
              For privacy inquiries:{' '}
              <a href="mailto:hello@predivo.ch" className="text-blue-400 hover:text-blue-300">hello@predivo.ch</a>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <a href="/" className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 min-h-[44px]">&larr; Back to LaunchReady</a>
        </div>
      </div>
    </section>
  )
}
