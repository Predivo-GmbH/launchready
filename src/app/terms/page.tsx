import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — LaunchReady',
  description: 'Terms of service for LaunchReady by Predivo GmbH.',
}

export default function Terms() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-zinc-500">Last updated: March 10, 2026</p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">1. Service Provider</h2>
            <p>LaunchReady is operated by Predivo GmbH, Switzerland (CHE-374.611.592).</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">2. Service Description</h2>
            <p>LaunchReady provides automated website SEO audits with AI-generated fix code. The service is provided &quot;as is&quot; and results are recommendations, not guarantees of search engine rankings.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">3. Account & Plans</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Free accounts are limited to 1 audit per month with basic results</li>
              <li>Paid plans unlock additional features as described on our pricing page</li>
              <li>You are responsible for maintaining the security of your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">4. Acceptable Use</h2>
            <p>You may only audit websites you own or have permission to audit. Automated bulk scanning, scraping, or abuse of the service is prohibited.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">5. Limitation of Liability</h2>
            <p>Predivo GmbH is not liable for any damages arising from the use of audit results. SEO recommendations are best-effort and do not guarantee specific outcomes.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">6. Cancellation</h2>
            <p>Paid plans can be cancelled at any time. Access continues until the end of the billing period.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">7. Governing Law</h2>
            <p>These terms are governed by Swiss law. Jurisdiction is at the registered office of Predivo GmbH.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">8. Contact</h2>
            <p>For questions about these terms: info@predivo.ch</p>
          </div>
        </div>
      </div>
    </section>
  )
}
