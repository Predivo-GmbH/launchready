import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorks } from '@/components/landing/HowItWorks'

// ── F-002: How It Works Section ──

describe('HowItWorks', () => {
  it('renders the section heading', () => {
    render(<HowItWorks />)
    expect(screen.getByText('How it works')).toBeInTheDocument()
  })

  it('renders all 4 steps', () => {
    render(<HowItWorks />)
    expect(screen.getByText('Paste your URL')).toBeInTheDocument()
    expect(screen.getByText('We audit everything')).toBeInTheDocument()
    expect(screen.getByText('Get copy-paste fixes')).toBeInTheDocument()
    expect(screen.getByText('Get found on Google')).toBeInTheDocument()
  })

  it('renders step descriptions', () => {
    render(<HowItWorks />)
    expect(screen.getByText(/React, WordPress, Wix/)).toBeInTheDocument()
    expect(screen.getByText(/Meta tags, OG data/)).toBeInTheDocument()
    expect(screen.getByText(/Exact code for every issue/)).toBeInTheDocument()
    expect(screen.getByText(/Search Console, Business Profile/)).toBeInTheDocument()
  })

  it('renders a section element', () => {
    const { container } = render(<HowItWorks />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
