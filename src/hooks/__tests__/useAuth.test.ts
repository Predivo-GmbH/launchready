import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

// ── F-029: useAuth Hook ──

// The supabase mock is set up in setup.ts

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null user by default', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('returns free plan by default', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.plan).toBe('free')
  })

  it('provides a signOut function', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.signOut).toBe('function')
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useAuth())
    // Should start as loading (unless screenshot mode)
    expect(result.current.loading).toBe(true)
  })
})
