'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase processes the hash fragment on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Password updated</h1>
          <p className="text-sm text-zinc-400">Your password has been reset successfully.</p>
          <Link href="/" className="inline-flex items-center min-h-[44px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
            Go to LaunchReady
          </Link>
        </div>
      </section>
    )
  }

  if (!ready) {
    return (
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-zinc-400" role="status" aria-live="polite">Processing your reset link...</p>
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" aria-hidden="true" />
          <p className="text-xs text-zinc-500 mt-4">If this page doesn&apos;t update, your reset link may be expired. <Link href="/" className="text-blue-400 hover:text-blue-300 inline-flex items-center min-h-[44px]">Request a new one</Link>.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-24 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white text-center">Set new password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password"
              aria-label="New password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-zinc-500 mt-1.5">Minimum 8 characters</p>
          </div>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            aria-label="Confirm new password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Update password
          </button>
        </form>
      </div>
    </section>
  )
}
