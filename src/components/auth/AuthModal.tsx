'use client'

import { useState } from 'react'
import { X, Loader2, Mail } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'login' | 'signup'
}

export function AuthModal({ onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { supabase } = await import('@/lib/supabase')

      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://launchready.predivo.ch/reset-password',
        })
        if (error) throw error
        setResetSent(true)
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSignupDone(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (signupDone) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-sm text-zinc-400">We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.</p>
          <p className="text-xs text-zinc-500">Didn&apos;t receive it? Check your spam folder.</p>
          <button onClick={onClose} className="text-sm text-blue-400 hover:text-blue-300">Close</button>
        </div>
      </Overlay>
    )
  }

  if (resetSent) {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Reset link sent</h2>
          <p className="text-sm text-zinc-400">If an account exists for <span className="text-white">{email}</span>, you&apos;ll receive a password reset link.</p>
          <p className="text-xs text-zinc-500">Didn&apos;t receive it? Check your spam folder.</p>
          <button onClick={onClose} className="text-sm text-blue-400 hover:text-blue-300">Close</button>
        </div>
      </Overlay>
    )
  }

  if (mode === 'forgot') {
    return (
      <Overlay onClose={onClose}>
        <h2 className="text-xl font-bold text-white mb-2">Reset password</h2>
        <p className="text-sm text-zinc-400 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send reset link
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-4 text-center">
          <button onClick={() => { setMode('login'); setError(null) }} className="text-blue-400 hover:text-blue-300">
            Back to log in
          </button>
        </p>
      </Overlay>
    )
  }

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-xl font-bold text-white mb-6">{mode === 'login' ? 'Log in' : 'Create account'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500"
        />
        <div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {mode === 'signup' && (
            <p className="text-xs text-zinc-500 mt-1.5">Minimum 6 characters</p>
          )}
        </div>

        {mode === 'login' && (
          <div className="text-right">
            <button type="button" onClick={() => { setMode('forgot'); setError(null) }} className="text-xs text-zinc-500 hover:text-zinc-300">
              Forgot password?
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {mode === 'signup' && (
          <p className="text-xs text-zinc-500">
            By signing up, you agree to our{' '}
            <a href="/terms" target="_blank" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-zinc-400 mt-4 text-center">
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }} className="text-blue-400 hover:text-blue-300">
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Authentication" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close dialog" className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1"><X className="w-5 h-5" /></button>
        {children}
      </div>
    </div>
  )
}
