'use client'

import { useState, useEffect, type ReactNode } from 'react'

const GATE_PASSWORD_HASH = '32d43275fd4146b8820205cc69833cc2fd81ad9cdf84ffad1140b87e88fa89a8'
const STORAGE_KEY = 'launchready-unlocked'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const isScreenshotMode = process.env.NEXT_PUBLIC_SCREENSHOT_MODE === 'true'
  const [mounted, setMounted] = useState(isScreenshotMode)
  const [unlocked, setUnlocked] = useState(isScreenshotMode)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isScreenshotMode) return
    setUnlocked(sessionStorage.getItem(STORAGE_KEY) === 'true')
    setMounted(true)
  }, [isScreenshotMode])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950" />
    )
  }

  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inputHash = await sha256(password)
    if (inputHash === GATE_PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm border border-zinc-800 rounded-2xl p-4 sm:p-8 bg-zinc-900">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">LaunchReady</h1>
          <p className="text-sm text-zinc-400 mt-2">This app is in private beta.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Enter access code"
            aria-label="Access code"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {error && <p role="alert" className="text-sm text-red-400">Incorrect access code.</p>}
          <button type="submit" className="w-full py-3 min-h-[44px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
