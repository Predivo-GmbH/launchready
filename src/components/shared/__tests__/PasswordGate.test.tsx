import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordGate } from '@/components/shared/PasswordGate'

// ── F-016: Password Gate ──

describe('PasswordGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset sessionStorage mock
    vi.mocked(window.sessionStorage.getItem).mockReturnValue(null)
  })

  it('shows gate UI on first visit', () => {
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('This app is in private beta.')).toBeInTheDocument()
    expect(screen.getByLabelText('Access code')).toBeInTheDocument()
  })

  it('renders LaunchReady heading in gate', () => {
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('LaunchReady')).toBeInTheDocument()
  })

  it('has Enter button', () => {
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument()
  })

  it('shows error on wrong password', async () => {
    const user = userEvent.setup()
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )

    await user.type(screen.getByLabelText('Access code'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Enter' }))

    expect(screen.getByText('Incorrect access code.')).toBeInTheDocument()
  })

  it('shows children when already unlocked via sessionStorage', () => {
    vi.mocked(window.sessionStorage.getItem).mockReturnValue('true')
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )
    expect(screen.getByText('App Content')).toBeInTheDocument()
  })

  it('has password input type', () => {
    render(
      <PasswordGate>
        <div>App Content</div>
      </PasswordGate>,
    )
    const input = screen.getByLabelText('Access code')
    expect(input).toHaveAttribute('type', 'password')
  })
})
