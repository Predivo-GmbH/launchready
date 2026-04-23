import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyButton } from '@/components/ui/CopyButton'

// ── F-014: Copy Button ──

describe('CopyButton', () => {
  beforeEach(() => {
    // Ensure clipboard mock resolves successfully by default
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined)
  })

  it('renders with "Copy" text in idle state', () => {
    render(<CopyButton text="test content" />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<CopyButton text="test" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Copy to clipboard')
  })

  it('transitions to Copied state on successful copy', async () => {
    const user = userEvent.setup()
    render(<CopyButton text="copy me" />)

    // Before click: shows "Copy"
    expect(screen.getByText('Copy')).toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    // After click: should show "Copied!"
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copied to clipboard')
  })

  it('shows "Copied!" state after successful copy', async () => {
    const user = userEvent.setup()
    render(<CopyButton text="test" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('shows "Failed" state when clipboard write fails', async () => {
    // Override writeText to reject
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('denied'))

    const user = userEvent.setup()
    render(<CopyButton text="test" />)

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Failed to copy')
  })
})
