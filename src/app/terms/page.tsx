import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — LaunchReady',
  description: 'Terms of service for LaunchReady by Predivo GmbH. Read about acceptable use, plan features, intellectual property, liability, and cancellation policies.',
  openGraph: {
    title: 'Terms of Service — LaunchReady',
    description: 'Acceptable use, plan features, intellectual property, and cancellation policies.',
    images: [{ url: 'https://launchready.predivo.ch/og-image.png', width: 1200, height: 630, alt: 'LaunchReady — Post-Launch Website Audit' }],
  },
}

export default function Terms() {
  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-sm text-zinc-400">Last updated: March 10, 2026</p>

        <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
          <div>
            <h2 className="text-white font-semibold mb-2">1. Service Provider</h2>
            <p>
              LaunchReady is operated by Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi,
              Switzerland (UID: CHE-374.611.592).
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">2. Service Description</h2>
            <p>
              LaunchReady provides automated website SEO audits with AI-generated fix code.
              The service is provided &quot;as is&quot; and results are recommendations, not
              guarantees of search engine rankings or any specific outcome.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">3. Account &amp; Plans</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Free accounts are limited to 1 audit per month with basic results</li>
              <li>Paid plans unlock additional features as described on our <a href="/pricing" className="text-blue-400 hover:text-blue-300">pricing page</a></li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must provide accurate information when creating an account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">4. Acceptable Use</h2>
            <p>
              You may only audit websites you own or have explicit permission to audit.
              The following are prohibited:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Automated bulk scanning or scraping</li>
              <li>Attempting to overload, disrupt, or exploit the service</li>
              <li>Using the service for unlawful purposes</li>
              <li>Reselling or redistributing audit results without permission</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">5. Intellectual Property</h2>
            <p>
              The LaunchReady service, its design, code, and branding are the property of Predivo GmbH
              and are protected by Swiss copyright law. Audit results generated for your websites are
              yours to use freely. The underlying audit engine, AI prompts, and scoring algorithms
              remain our intellectual property.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">6. Limitation of Liability</h2>
            <p>
              Predivo GmbH is not liable for any direct, indirect, or consequential damages arising
              from the use of audit results. SEO recommendations are best-effort and do not guarantee
              specific outcomes. You are solely responsible for reviewing and implementing any
              suggested code changes on your website.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">7. Cancellation &amp; Refunds</h2>
            <p>
              Paid plans can be cancelled at any time. Access to paid features continues until the
              end of the current billing period. Refunds are not provided for partial billing periods.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">8. Data &amp; Privacy</h2>
            <p>
              Your use of LaunchReady is also governed by our{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>,
              which describes how we collect, store, and process your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. The current version is always
              available on this page. Continued use of the service after changes constitutes
              acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">10. Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable, the remaining provisions
              shall continue in full force and effect.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">11. Governing Law</h2>
            <p>
              These terms are governed by Swiss law. The exclusive place of jurisdiction is at
              the registered office of Predivo GmbH in Küssnacht am Rigi, Switzerland.
            </p>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-2">12. Contact</h2>
            <p>
              For questions about these terms:{' '}
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
