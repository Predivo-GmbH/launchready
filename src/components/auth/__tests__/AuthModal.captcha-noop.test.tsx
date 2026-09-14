/**
 * AuthModal.captcha-noop.test.tsx — proves the fix is outage-safe today.
 *
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset in every environment right now (no Cloudflare Turnstile
 * site key has been minted for LaunchReady yet — see TurnstileWidget.tsx). Deliberately does NOT
 * mock TurnstileWidget: the REAL component renders here, exactly as it does in production today,
 * and asserts it renders nothing and the captcha-protected Supabase call carries no captchaToken key
 * at all — proving this change cannot lock anyone out or alter behavior until a real site key exists.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from '@/components/auth/AuthModal'
import { supabase } from '@/lib/supabase'

describe('AuthModal + real TurnstileWidget with no site key configured', () => {
  it('renders no Turnstile widget', () => {
    const { container } = render(<AuthModal onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(container.querySelector('.min-h-\\[65px\\]')).toBeNull()
  })

  it('login OTP omits captchaToken entirely (outage-safe no-op)', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={vi.fn()} onSuccess={vi.fn()} />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByText('Send me a login code'))
    await waitFor(() => expect(supabase.auth.signInWithOtp).toHaveBeenCalled())
    const arg = (supabase.auth.signInWithOtp as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(arg).toEqual({ email: 'user@example.com' })
    expect('options' in arg).toBe(false)
  })
})
