import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MonitoredSites } from '@/components/monitoring/MonitoredSites'

// ── F-012: Monitored Sites ──

// Override the global supabase mock with one that resolves the chain
vi.mock('@/lib/supabase', () => {
  const createChain = (resolvedData: unknown = []) => {
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'gte', 'limit', 'single']
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    // Make chain thenable so await works
    chain.then = (resolve: (value: unknown) => void) => {
      resolve({ data: resolvedData, error: null })
      return chain
    }
    return chain
  }

  return {
    supabase: {
      from: vi.fn(() => createChain([])),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    },
    getSupabase: vi.fn(),
  }
})

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils')
  return {
    ...actual,
    fetchWithTimeout: vi.fn().mockResolvedValue(new Response(JSON.stringify({ overall_score: 80 }))),
    buildAuthHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  }
})

describe('MonitoredSites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    render(<MonitoredSites plan="pro" />)
    expect(screen.getByText('Loading monitored sites...')).toBeInTheDocument()
  })

  it('has accessible loading indicator', () => {
    render(<MonitoredSites plan="pro" />)
    const loading = screen.getByRole('status')
    expect(loading).toBeInTheDocument()
  })

  it('renders the Monitored Sites heading after loading', async () => {
    render(<MonitoredSites plan="pro" />)
    await waitFor(() => {
      expect(screen.getByText('Monitored Sites')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows empty state when no sites', async () => {
    render(<MonitoredSites plan="pro" />)
    await waitFor(() => {
      expect(screen.getByText(/No monitored sites yet/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows Add Site button for pro plan', async () => {
    render(<MonitoredSites plan="pro" />)
    await waitFor(() => {
      expect(screen.getByText('Add Your First Site')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
