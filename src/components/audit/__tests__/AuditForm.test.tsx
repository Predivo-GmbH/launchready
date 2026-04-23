import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuditForm } from '@/components/audit/AuditForm'

// ── F-005: Audit Form ──

// Mock useAuth to return unauthenticated state
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    plan: 'free' as const,
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('AuditForm', () => {
  it('renders URL input', () => {
    render(<AuditForm />)
    expect(screen.getByLabelText('Website URL')).toBeInTheDocument()
  })

  it('renders Audit button', () => {
    render(<AuditForm />)
    expect(screen.getByRole('button', { name: 'Audit' })).toBeInTheDocument()
  })

  it('has placeholder text', () => {
    render(<AuditForm />)
    expect(screen.getByPlaceholderText('Enter your website URL...')).toBeInTheDocument()
  })

  it('button is disabled when input is empty', () => {
    render(<AuditForm />)
    const button = screen.getByRole('button', { name: 'Audit' })
    expect(button).toBeDisabled()
  })

  it('button is enabled when input has text', async () => {
    const user = userEvent.setup()
    render(<AuditForm />)
    const input = screen.getByLabelText('Website URL')
    await user.type(input, 'example.com')
    const button = screen.getByRole('button', { name: 'Audit' })
    expect(button).not.toBeDisabled()
  })

  it('input has url inputMode', () => {
    render(<AuditForm />)
    const input = screen.getByLabelText('Website URL')
    expect(input).toHaveAttribute('inputMode', 'url')
  })
})
