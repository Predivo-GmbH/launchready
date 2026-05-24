'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Loader2, Mail, ArrowLeft, KeyRound, Lock } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
  initialMode?: 'login' | 'signup'
}

type Step =
  | 'signup-email'       // Enter email to sign up
  | 'signup-otp'         // Enter OTP to verify email
  | 'signup-password'    // Set a password (optional)
  | 'login-choose'       // Enter email, choose method
  | 'login-password'     // Enter password
  | 'login-otp-sent'     // OTP/magic link sent for login
  | 'login-otp'          // Enter OTP code for login
  | 'forgot'             // Forgot password email entry
  | 'forgot-sent'        // Reset link sent

const INPUT = 'w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors'
const BTN_PRIMARY = 'w-full min-h-[44px] py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2'
const BTN_SECONDARY = 'w-full min-h-[44px] py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-zinc-700'

export function AuthModal({ onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [step, setStep] = useState<Step>(initialMode === 'signup' ? 'signup-email' : 'login-choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  function reset(nextStep: Step) {
    setError(null)
    setPassword('')
    setOtp(['', '', '', '', '', ''])
    setStep(nextStep)
  }

  function otpValue() { return otp.join('') }

  function handleOtpChange(idx: number, val: string) {
    if (val.length > 1) val = val.slice(-1)
    if (val && !/^\d$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      e.preventDefault()
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  // ── Sign up: send OTP ──
  async function sendSignupOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setStep('signup-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP (signup or login) ──
  async function verifyOtp(e: React.FormEvent, afterVerify: 'set-password' | 'done') {
    e.preventDefault()
    const code = otpValue()
    if (code.length !== 6) { setError('Enter the 6-digit code'); return }
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) throw error
      if (afterVerify === 'set-password') {
        setStep('signup-password')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  // ── Set password after OTP verification ──
  async function setUserPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  // ── Login with password ──
  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  // ── Login with OTP/magic link ──
  async function sendLoginOtp() {
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setStep('login-otp-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login code')
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot password ──
  async function sendResetLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setStep('forgot-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ──
  async function resendOtp() {
    setError(null)
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setOtp(['', '', '', '', '', ''])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  // ──────────── RENDER ────────────

  // SIGNUP: Enter email
  if (step === 'signup-email') {
    return (
      <Overlay onClose={onClose}>
        <h2 className="text-xl font-bold text-white mb-2">Create account</h2>
        <p className="text-sm text-zinc-400 mb-6">We&apos;ll send a verification code to your email.</p>

        <form onSubmit={sendSignupOtp} className="space-y-4">
          <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" aria-label="Email" required autoComplete="email" autoFocus className={INPUT} />
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <p className="text-xs text-zinc-400">
            By signing up, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center min-h-[44px]">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center min-h-[44px]">Privacy Policy</a>.
          </p>

          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Send verification code
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-4 text-center">
          Already have an account?{' '}
          <button onClick={() => reset('login-choose')} className="text-blue-400 hover:text-blue-300 min-h-[44px]">Log in</button>
        </p>
      </Overlay>
    )
  }

  // SIGNUP: Verify OTP
  if (step === 'signup-otp') {
    return (
      <Overlay onClose={onClose}>
        <BackButton onClick={() => reset('signup-email')} />
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-sm text-zinc-400 mt-2">Enter the 6-digit code sent to <span className="text-white">{email}</span></p>
        </div>

        <form onSubmit={e => verifyOtp(e, 'set-password')} className="space-y-4">
          <OtpInputRow otp={otp} otpRefs={otpRefs} onOtpChange={handleOtpChange} onOtpKeyDown={handleOtpKeyDown} onOtpPaste={handleOtpPaste} />
          {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={loading || otpValue().length !== 6} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Verify email
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-4 text-center">
          Didn&apos;t receive it?{' '}
          <button onClick={resendOtp} disabled={loading} className="text-blue-400 hover:text-blue-300 disabled:text-zinc-600 min-h-[44px]">Resend code</button>
        </p>
      </Overlay>
    )
  }

  // SIGNUP: Set password (after OTP verified — user is now logged in)
  if (step === 'signup-password') {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-green-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Email verified!</h2>
          <p className="text-sm text-zinc-400 mt-2">Set a password so you can log in faster next time.</p>
        </div>

        <form onSubmit={setUserPassword} className="space-y-4">
          <div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" aria-label="Create a password" required minLength={8} autoComplete="new-password" autoFocus className={INPUT} />
            <p className="text-xs text-zinc-400 mt-1.5">Minimum 8 characters</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Set password
          </button>
        </form>

        <button onClick={onSuccess} className="w-full text-sm text-zinc-400 hover:text-zinc-300 mt-3 text-center transition-colors min-h-[44px]">
          Skip for now
        </button>
      </Overlay>
    )
  }

  // LOGIN: Choose method
  if (step === 'login-choose') {
    return (
      <Overlay onClose={onClose}>
        <h2 className="text-xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-sm text-zinc-400 mb-6">Enter your email to log in.</p>

        <div className="space-y-4">
          <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" autoFocus className={INPUT} />
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <button onClick={() => { if (!email.trim()) { setError('Enter your email'); return }; sendLoginOtp() }} disabled={loading} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <Mail className="w-4 h-4" aria-hidden="true" />
            Send me a login code
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
            <div className="relative flex justify-center"><span className="bg-zinc-900 px-3 text-xs text-zinc-400">or</span></div>
          </div>

          <button onClick={() => { if (!email.trim()) { setError('Enter your email'); return }; setError(null); setStep('login-password') }} className={BTN_SECONDARY}>
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            Use password
          </button>
        </div>

        <p className="text-sm text-zinc-400 mt-4 text-center">
          Don&apos;t have an account?{' '}
          <button onClick={() => reset('signup-email')} className="text-blue-400 hover:text-blue-300 min-h-[44px]">Sign up</button>
        </p>
      </Overlay>
    )
  }

  // LOGIN: OTP sent confirmation
  if (step === 'login-otp-sent') {
    return (
      <Overlay onClose={onClose}>
        <BackButton onClick={() => reset('login-choose')} />
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Check your email</h2>
          <p className="text-sm text-zinc-400 mt-2">
            We sent a login link and code to <span className="text-white">{email}</span>
          </p>
          <p className="text-xs text-zinc-400 mt-1">Click the link in the email, or enter the code below.</p>
        </div>

        <button onClick={() => setStep('login-otp')} className={BTN_PRIMARY}>
          Enter code manually
        </button>

        <p className="text-xs text-zinc-400 mt-4 text-center">
          Didn&apos;t receive it?{' '}
          <button onClick={resendOtp} disabled={loading} className="text-blue-400 hover:text-blue-300 disabled:text-zinc-600 min-h-[44px]">Resend</button>
        </p>
      </Overlay>
    )
  }

  // LOGIN: Enter OTP
  if (step === 'login-otp') {
    return (
      <Overlay onClose={onClose}>
        <BackButton onClick={() => setStep('login-otp-sent')} />
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Enter login code</h2>
          <p className="text-sm text-zinc-400 mt-2">6-digit code sent to <span className="text-white">{email}</span></p>
        </div>

        <form onSubmit={e => verifyOtp(e, 'done')} className="space-y-4">
          <OtpInputRow otp={otp} otpRefs={otpRefs} onOtpChange={handleOtpChange} onOtpKeyDown={handleOtpKeyDown} onOtpPaste={handleOtpPaste} />
          {error && <p role="alert" className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={loading || otpValue().length !== 6} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Log in
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-4 text-center">
          Didn&apos;t receive it?{' '}
          <button onClick={resendOtp} disabled={loading} className="text-blue-400 hover:text-blue-300 disabled:text-zinc-600 min-h-[44px]">Resend code</button>
        </p>
      </Overlay>
    )
  }

  // LOGIN: Password
  if (step === 'login-password') {
    return (
      <Overlay onClose={onClose}>
        <BackButton onClick={() => reset('login-choose')} />
        <h2 className="text-xl font-bold text-white mb-6">Log in with password</h2>

        <form onSubmit={loginWithPassword} className="space-y-4">
          <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" aria-label="Email" required autoComplete="email" className={INPUT} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" aria-label="Password" required minLength={8} autoComplete="current-password" autoFocus className={INPUT} />

          <div className="text-right">
            <button type="button" onClick={() => { setError(null); setStep('forgot') }} className="text-xs text-zinc-400 hover:text-zinc-300 min-h-[44px]">
              Forgot password?
            </button>
          </div>

          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Log in
          </button>
        </form>
      </Overlay>
    )
  }

  // FORGOT: Enter email
  if (step === 'forgot') {
    return (
      <Overlay onClose={onClose}>
        <BackButton onClick={() => reset('login-password')} />
        <h2 className="text-xl font-bold text-white mb-2">Reset password</h2>
        <p className="text-sm text-zinc-400 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={sendResetLink} className="space-y-4">
          <input type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" aria-label="Email" required autoComplete="email" autoFocus className={INPUT} />
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Send reset link
          </button>
        </form>
      </Overlay>
    )
  }

  // FORGOT: Sent
  if (step === 'forgot-sent') {
    return (
      <Overlay onClose={onClose}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">Reset link sent</h2>
          <p className="text-sm text-zinc-400">If an account exists for <span className="text-white">{email}</span>, you&apos;ll receive a password reset link.</p>
          <p className="text-xs text-zinc-400">Didn&apos;t receive it? Check your spam folder.</p>
          <button onClick={onClose} className="text-sm text-blue-400 hover:text-blue-300 min-h-[44px]">Close</button>
        </div>
      </Overlay>
    )
  }

  return null
}

interface OtpInputRowProps {
  otp: string[]
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onOtpChange: (idx: number, val: string) => void
  onOtpKeyDown: (idx: number, e: React.KeyboardEvent) => void
  onOtpPaste: (e: React.ClipboardEvent) => void
}

function OtpInputRow({ otp, otpRefs, onOtpChange, onOtpKeyDown, onOtpPaste }: OtpInputRowProps) {
  return (
    <fieldset className="flex justify-center gap-2" onPaste={onOtpPaste}>
      <legend className="sr-only">6-digit verification code</legend>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => { otpRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => onOtpChange(i, e.target.value)}
          onKeyDown={e => onOtpKeyDown(i, e)}
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1} of 6`}
          className="w-11 min-h-[44px] h-12 text-center text-xl font-bold bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          autoFocus={i === 0}
        />
      ))}
    </fieldset>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors mb-4 min-h-[44px]">
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />Back
    </button>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onCloseRef.current(); return }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previousFocus.current?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Authentication" onClick={onClose}>
      <div ref={dialogRef} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close dialog" className="absolute top-2 right-2 sm:top-4 sm:right-4 text-zinc-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" aria-hidden="true" /></button>
        {children}
      </div>
    </div>
  )
}
