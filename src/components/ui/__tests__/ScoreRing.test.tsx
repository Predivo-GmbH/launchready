import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreRing } from '@/components/ui/ScoreRing'

// ── F-013: Score Ring ──

describe('ScoreRing', () => {
  it('renders the score number', () => {
    render(<ScoreRing score={85} />)
    expect(screen.getByText('85')).toBeInTheDocument()
  })

  it('has accessible aria-label with score', () => {
    render(<ScoreRing score={92} />)
    const ring = screen.getByRole('img')
    expect(ring).toHaveAttribute('aria-label', 'Score: 92 out of 100')
  })

  it('includes label in aria-label when provided', () => {
    render(<ScoreRing score={75} label="Performance" />)
    const ring = screen.getByRole('img')
    expect(ring).toHaveAttribute('aria-label', 'Score: 75 out of 100, Performance')
  })

  it('renders label text when provided', () => {
    render(<ScoreRing score={60} label="SEO" />)
    expect(screen.getByText('SEO')).toBeInTheDocument()
  })

  it('renders SVG element', () => {
    const { container } = render(<ScoreRing score={50} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('accepts custom size prop', () => {
    const { container } = render(<ScoreRing score={50} size={200} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('renders two circle elements (background + progress)', () => {
    const { container } = render(<ScoreRing score={75} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
  })
})
