import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Error from '@/app/error'

// ── F-018: Error Boundary ──

describe('Error page', () => {
  it('renders error heading', () => {
    render(<Error error={new Error('test')} reset={vi.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders error description', () => {
    render(<Error error={new Error('test')} reset={vi.fn()} />)
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })

  it('renders Try again button', () => {
    render(<Error error={new Error('test')} reset={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('calls reset when Try again is clicked', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    render(<Error error={new Error('test')} reset={reset} />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(reset).toHaveBeenCalledOnce()
  })

  it('has back to home link', () => {
    render(<Error error={new Error('test')} reset={vi.fn()} />)
    const link = screen.getByText('Back to home')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('has alert role', () => {
    const { container } = render(<Error error={new Error('test')} reset={vi.fn()} />)
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
  })
})
