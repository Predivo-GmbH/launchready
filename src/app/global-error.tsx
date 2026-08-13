'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Catches errors thrown in the root layout itself (above route-level
// error.tsx boundaries) and reports them to Sentry. Client-only, matching
// this app's static-export deployment (see src/instrumentation-client.ts).
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please refresh the page.</p>
        </section>
      </body>
    </html>
  )
}
