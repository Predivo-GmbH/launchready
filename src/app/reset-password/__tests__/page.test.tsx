import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResetPassword from '@/app/reset-password/page'

// ── F-010: Password Reset Page ──

describe('ResetPassword page', () => {
  it('renders heading', () => {
    render(<ResetPassword />)
    expect(screen.getByText('Reset your password')).toBeInTheDocument()
  })

  it('shows processing message initially', () => {
    render(<ResetPassword />)
    expect(screen.getByText('Processing your reset link...')).toBeInTheDocument()
  })

  it('shows link to request new reset', () => {
    render(<ResetPassword />)
    expect(screen.getByText('Request a new one')).toBeInTheDocument()
  })

  it('has a loading spinner', () => {
    const { container } = render(<ResetPassword />)
    // Loader2 icon renders an SVG with animate-spin class
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('has status role for processing message', () => {
    render(<ResetPassword />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
