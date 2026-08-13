'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <section className="py-16 sm:py-24 px-4" role="alert">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-zinc-400">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Try again
        </button>
        <a href="/" className="block text-sm text-zinc-400 hover:text-white transition-colors mt-4 min-h-[44px] inline-flex items-center justify-center">Back to home</a>
      </div>
    </section>
  )
}
