import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// ── Global Supabase mock ──
// Prevents real Supabase calls in CI and unit tests
vi.mock('@/lib/supabase', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  }))

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  }

  return {
    supabase: {
      from: mockFrom,
      auth: mockAuth,
    },
    getSupabase: vi.fn(() => ({
      from: mockFrom,
      auth: mockAuth,
    })),
  }
})

// ── Mock next/navigation ──
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// ── Mock next/link ──
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  },
}))

// ── Mock next/font/google ──
vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mock-inter' }),
}))

// ── Mock clipboard API ──
// Use defineProperty with configurable:true so tests can override
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
})

// ── Mock sessionStorage ──
const sessionStorageData: Record<string, string> = {}
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key: string) => sessionStorageData[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { sessionStorageData[key] = value }),
    removeItem: vi.fn((key: string) => { delete sessionStorageData[key] }),
    clear: vi.fn(() => { for (const key in sessionStorageData) delete sessionStorageData[key] }),
    get length() { return Object.keys(sessionStorageData).length },
    key: vi.fn((i: number) => Object.keys(sessionStorageData)[i] ?? null),
  },
  writable: true,
})

// ── Mock crypto.subtle for PasswordGate ──
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(async (_algo: string, data: ArrayBuffer) => {
        // Simple mock: return a fixed hash for testing
        return new Uint8Array(32).buffer
      }),
    },
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
      return arr
    }),
  },
  writable: true,
})
