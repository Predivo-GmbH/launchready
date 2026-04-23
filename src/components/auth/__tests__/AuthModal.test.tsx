import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from '@/components/auth/AuthModal'

// ── F-009: Auth Modal ──

describe('AuthModal', () => {
  const onClose = vi.fn()
  const onSuccess = vi.fn()

  it('renders login mode by default', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders signup mode when specified', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} initialMode="signup" />)
    expect(screen.getByText('Create account')).toBeInTheDocument()
  })

  it('has email input', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('has close button', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    await user.click(screen.getByLabelText('Close dialog'))
    expect(onClose).toHaveBeenCalled()
  })

  it('has dialog role with aria-modal', () => {
    const { container } = render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('shows "Send me a login code" button in login mode', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByText('Send me a login code')).toBeInTheDocument()
  })

  it('shows "Use password" button in login mode', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByText('Use password')).toBeInTheDocument()
  })

  it('can switch to signup mode', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} />)
    await user.click(screen.getByText('Sign up'))
    expect(screen.getByText('Create account')).toBeInTheDocument()
  })

  it('can switch from signup to login mode', async () => {
    const user = userEvent.setup()
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} initialMode="signup" />)
    await user.click(screen.getByText('Log in'))
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('shows terms/privacy links in signup mode', () => {
    render(<AuthModal onClose={onClose} onSuccess={onSuccess} initialMode="signup" />)
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })
})
