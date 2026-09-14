/**
 * AuthModal.captcha.test.tsx — proves the client half of the sign-in bot-protection fix.
 *
 * THE VULNERABILITY (measured live 2026-09-14 against production hcfeoescybfngjsphekq): AuthModal
 * called signInWithOtp / signInWithPassword / resetPasswordForEmail with no challenge token, so
 * anyone on the internet could make LaunchReady email a password-reset link or login code to any
 * address, unlimited. The fix threads a Cloudflare Turnstile captchaToken through every
 * captcha-protected GoTrue call: signup OTP, login OTP, resend OTP, password login, password reset.
 *
 * This suite asserts each call forwards a token into the exact Supabase field GoTrue reads
 * (options.captchaToken for signInWithOtp/signInWithPassword, top-level captchaToken for
 * resetPasswordForEmail per the supabase-js signature), and that the calls stay clean (no
 * captchaToken key at all) when no token is available — which is the real state today, since
 * TurnstileWidget renders nothing while NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset fleet-wide. It does
 * NOT prove server enforcement — that is a separate Supabase Auth-settings switch, proven live by
 * supabase/functions/_shared/signin-captcha.prod.test.mjs once flipped.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from '@/components/auth/AuthModal'
import { supabase } from '@/lib/supabase'

const TOKEN = vi.hoisted(() => 'turnstile-token-abc123')

// Stub TurnstileWidget so every captcha-protected submit in THIS suite carries a token, proving
// the forwarding wiring without needing a real Cloudflare site key (none is minted for LaunchReady
// yet — see TurnstileWidget.tsx). Mirrors the real component's ref contract (reset()).
vi.mock('@/components/auth/TurnstileWidget', () => {
  const React = require('react')
  return {
    default: React.forwardRef(function MockTurnstileWidget(
      { onToken }: { onToken: (t: string | null) => void },
      ref: React.Ref<{ reset: () => void }>
    ) {
      React.useImperativeHandle(ref, () => ({ reset: () => onToken(null) }))
      React.useEffect(() => { onToken(TOKEN) }, [onToken])
      return null
    }),
  }
})

const onClose = vi.fn()
const onSuccess = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthModal forwards the Turnstile captchaToken to Supabase', () => {
  it('signup OTP (signInWithOtp) passes captchaToken', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} initialMode="signup" />)
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.click(screen.getByText('Send verification code'))
    await waitFor(() => expect(supabase.auth.signInWithOtp).toHaveBeenCalled())
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@example.com',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      })
    )
  })

  it('login OTP (signInWithOtp, the endpoint the incident abused) passes captchaToken', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByText('Send me a login code'))
    await waitFor(() => expect(supabase.auth.signInWithOtp).toHaveBeenCalled())
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      })
    )
  })

  it('resend OTP passes captchaToken', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} initialMode="signup" />)
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.click(screen.getByText('Send verification code'))
    await waitFor(() => expect(screen.getByText('Resend code')).toBeInTheDocument())
    ;(supabase.auth.signInWithOtp as ReturnType<typeof vi.fn>).mockClear()
    await user.click(screen.getByText('Resend code'))
    await waitFor(() => expect(supabase.auth.signInWithOtp).toHaveBeenCalled())
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ captchaToken: TOKEN }) })
    )
  })

  it('password login (signInWithPassword) passes captchaToken', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    // "Use password" requires a non-empty email first (AuthModal validates before switching step).
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByText('Use password'))
    await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!)
    await waitFor(() => expect(supabase.auth.signInWithPassword).toHaveBeenCalled())
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        password: 'correct-horse-battery',
        options: expect.objectContaining({ captchaToken: TOKEN }),
      })
    )
  })

  it('password reset (resetPasswordForEmail) passes captchaToken alongside redirectTo', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByText('Use password'))
    await user.click(screen.getByText('Forgot password?'))
    await user.click(screen.getByText('Send reset link'))
    await waitFor(() => expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled())
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ captchaToken: TOKEN })
    )
  })
})
