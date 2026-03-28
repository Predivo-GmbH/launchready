'use client'

import { useState, useRef, useCallback } from 'react'
import { Check, Copy, AlertCircle } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('error')
    }
    timerRef.current = setTimeout(() => setState('idle'), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      aria-live="polite"
      aria-label={state === 'copied' ? 'Copied to clipboard' : state === 'error' ? 'Failed to copy' : 'Copy to clipboard'}
      className={`inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-md transition-colors ${
        state === 'copied' ? 'bg-green-500/20 text-green-400'
        : state === 'error' ? 'bg-red-500/20 text-red-400'
        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
      }`}
    >
      {state === 'copied' ? <Check className="w-4 h-4" aria-hidden="true" /> : state === 'error' ? <AlertCircle className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
      {state === 'copied' ? 'Copied!' : state === 'error' ? 'Failed' : 'Copy'}
    </button>
  )
}
