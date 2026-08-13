import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only used for source-map upload during `next build` (static export has
  // no server/edge runtime, so the Sentry webpack plugin's other Next.js
  // runtime hooks are inert here — this is intentional, see
  // src/instrumentation-client.ts).
  silent: !process.env.CI,
  telemetry: false,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
})
