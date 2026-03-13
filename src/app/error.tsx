'use client'

export default function Error({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-zinc-400">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </section>
  )
}
