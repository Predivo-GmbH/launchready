import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

// ── F-019: 404 Not Found ──

describe('NotFound page', () => {
  it('renders 404 text', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<NotFound />)
    expect(screen.getByText("This page doesn't exist.")).toBeInTheDocument()
  })

  it('has back to home link', () => {
    render(<NotFound />)
    const link = screen.getByText('Back to LaunchReady')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders section element', () => {
    const { container } = render(<NotFound />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
