import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Comparison } from '@/components/landing/Comparison'

// ── F-003: Comparison Table ──

describe('Comparison', () => {
  it('renders the section heading', () => {
    render(<Comparison />)
    expect(screen.getByText('Why not just use Lighthouse or Semrush?')).toBeInTheDocument()
  })

  it('renders the subheading', () => {
    render(<Comparison />)
    expect(screen.getByText('They report problems. We generate the fixes.')).toBeInTheDocument()
  })

  it('renders 3 column headers', () => {
    render(<Comparison />)
    expect(screen.getByText('LaunchReady')).toBeInTheDocument()
    // These use soft hyphens so match by role
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(4) // Feature + 3 products
  })

  it('renders feature rows', () => {
    render(<Comparison />)
    expect(screen.getByText('Per-page meta tag audit')).toBeInTheDocument()
    expect(screen.getByText('Copy-paste fix code')).toBeInTheDocument()
    expect(screen.getByText('AI-generated descriptions')).toBeInTheDocument()
    expect(screen.getByText('Lighthouse scores')).toBeInTheDocument()
    expect(screen.getByText('JSON-LD schema generation')).toBeInTheDocument()
  })

  it('renders the price row', () => {
    render(<Comparison />)
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('From $19/mo')).toBeInTheDocument()
    expect(screen.getByText('$140/mo')).toBeInTheDocument()
  })

  it('renders a table element', () => {
    const { container } = render(<Comparison />)
    expect(container.querySelector('table')).toBeInTheDocument()
  })

  it('has accessible sr-only Yes/No text for screen readers', () => {
    render(<Comparison />)
    const yesTexts = screen.getAllByText('Yes')
    const noTexts = screen.getAllByText('No')
    expect(yesTexts.length).toBeGreaterThan(0)
    expect(noTexts.length).toBeGreaterThan(0)
  })
})
