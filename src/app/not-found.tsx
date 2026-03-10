import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <Zap className="w-12 h-12 text-zinc-600 mx-auto" />
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <p className="text-zinc-400">This page doesn&apos;t exist.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Back to LaunchReady
        </a>
      </div>
    </section>
  )
}
