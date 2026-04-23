import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/layout/Header'

// ── F-015: Header & Navigation ──

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    plan: 'free' as const,
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('Header', () => {
  it('renders the LaunchReady logo link', () => {
    render(<Header />)
    const logo = screen.getByText('LaunchReady')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders desktop navigation', () => {
    render(<Header />)
    const nav = screen.getByLabelText('Main navigation')
    expect(nav).toBeInTheDocument()
  })

  it('has Pricing link in desktop nav', () => {
    render(<Header />)
    const nav = screen.getByLabelText('Main navigation')
    expect(nav.querySelector('a[href="/pricing"]')).toBeInTheDocument()
  })

  it('has How it works link in desktop nav', () => {
    render(<Header />)
    const nav = screen.getByLabelText('Main navigation')
    expect(nav.querySelector('a[href="/#how-it-works"]')).toBeInTheDocument()
  })

  it('shows Log in and Sign up buttons when not authenticated', () => {
    render(<Header />)
    expect(screen.getByText('Log in')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
  })

  it('has mobile hamburger button', () => {
    render(<Header />)
    const hamburger = screen.getByLabelText('Open menu')
    expect(hamburger).toBeInTheDocument()
  })

  it('toggles mobile menu on hamburger click', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const hamburger = screen.getByLabelText('Open menu')
    await user.click(hamburger)

    // After opening, mobile nav should be visible
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument()
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
  })

  it('renders header element', () => {
    const { container } = render(<Header />)
    expect(container.querySelector('header')).toBeInTheDocument()
  })
})
