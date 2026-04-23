import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/app/dashboard/page'

// ── F-011: Dashboard ──

// Mock useAuth for unauthenticated state
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    plan: 'free' as const,
    loading: false,
    signOut: vi.fn(),
  }),
}))

describe('Dashboard page (unauthenticated)', () => {
  it('shows login prompt when not authenticated', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Log in to see your audit history.')).toBeInTheDocument()
    })
  })

  it('shows Dashboard heading', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('shows Log in button', async () => {
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
    })
  })
})
