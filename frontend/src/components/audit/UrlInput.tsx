import { useState, type FormEvent } from 'react'
import { Globe, Loader2 } from 'lucide-react'

interface UrlInputProps {
  onSubmit: (url: string) => void
  loading: boolean
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    let normalizedUrl = url.trim()
    if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = `https://${normalizedUrl}`
    }
    if (normalizedUrl) {
      onSubmit(normalizedUrl)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your website URL..."
            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-lg"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Auditing...
            </>
          ) : (
            'Audit'
          )}
        </button>
      </div>
    </form>
  )
}
