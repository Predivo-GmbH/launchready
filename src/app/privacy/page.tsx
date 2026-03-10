import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LaunchReady',
  description: 'Privacy policy for LaunchReady by Predivo GmbH. How we handle your data.',
}

export default function Privacy() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: March 10, 2026</p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">1. Data Controller</h2>
            <p>Predivo GmbH, Switzerland (CHE-374.611.592) is responsible for the processing of personal data on this website.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">2. Data We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Email and password (when you create an account)</li>
              <li>URLs you submit for auditing</li>
              <li>Audit results and scores</li>
              <li>Usage data (page visits, feature usage)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">3. Purpose of Processing</h2>
            <p>We process your data to provide the LaunchReady audit service, manage your account, and improve our product. We do not sell your data to third parties.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">4. Data Storage</h2>
            <p>Data is stored on Supabase (hosted in the EU). Audit data is retained as long as your account is active. You can request deletion at any time.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">5. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Supabase — authentication and database</li>
              <li>Anthropic (Claude AI) — generating fix code for paid users</li>
              <li>Google PageSpeed Insights API — performance scores</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">6. Your Rights (DSG / GDPR)</h2>
            <p>You have the right to access, rectify, or delete your personal data. Contact us at info@predivo.ch to exercise these rights.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">7. Cookies</h2>
            <p>We use essential cookies for authentication. No tracking or advertising cookies are used.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">8. Contact</h2>
            <p>For privacy inquiries: info@predivo.ch</p>
          </div>
        </div>
      </div>
    </section>
  )
}
