// Sentry client-side error monitoring — free tier, errors only.
//
// LaunchReady builds as a static export (`output: 'export'` in next.config.ts)
// and is deployed as plain static files over FTP — there is no Node.js server
// or edge runtime at request time. That makes server-side and edge Sentry
// instrumentation (sentry.server.config.ts / sentry.edge.config.ts /
// instrumentation.ts's `register()`) inert dead code, since Next.js never
// invokes a server runtime for this deployment. Client-side capture (this
// file) is therefore the only wiring that does anything, and is intentionally
// the only wiring added.
import * as Sentry from '@sentry/nextjs'

// Same static build ships to every host (staging + eventual production);
// tag the environment at runtime from the hostname rather than at build time.
const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
const environment = hostname === 'launchready.predivo.ch' ? 'production' : 'staging'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,

  // Free-tier discipline: errors only. No performance tracing, no session
  // replay, no default PII scrubbing assumptions.
  tracesSampleRate: 0,
  sendDefaultPii: false,
})

// Adds navigation breadcrumbs to error reports (no tracing spans are sent —
// tracesSampleRate is 0 above).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

