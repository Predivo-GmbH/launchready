import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  scoreColor,
  scoreRingColor,
  scoreRgb,
  categoryLabel,
  countByStatus,
  fetchWithTimeout,
  buildAuthHeaders,
} from '@/lib/utils'
import type { AuditCheck } from '@/lib/types'

// ── F-023: Score Color Utilities ──

describe('scoreColor', () => {
  it('returns green for scores >= 90', () => {
    expect(scoreColor(90)).toBe('text-green-500')
    expect(scoreColor(100)).toBe('text-green-500')
    expect(scoreColor(95)).toBe('text-green-500')
  })

  it('returns yellow for scores >= 70 and < 90', () => {
    expect(scoreColor(70)).toBe('text-yellow-500')
    expect(scoreColor(89)).toBe('text-yellow-500')
  })

  it('returns orange for scores >= 50 and < 70', () => {
    expect(scoreColor(50)).toBe('text-orange-500')
    expect(scoreColor(69)).toBe('text-orange-500')
  })

  it('returns red for scores < 50', () => {
    expect(scoreColor(0)).toBe('text-red-500')
    expect(scoreColor(49)).toBe('text-red-500')
    expect(scoreColor(25)).toBe('text-red-500')
  })
})

describe('scoreRingColor', () => {
  it('returns green ring for scores >= 90', () => {
    expect(scoreRingColor(95)).toBe('text-green-500 stroke-green-500')
  })

  it('returns yellow ring for scores >= 70', () => {
    expect(scoreRingColor(75)).toBe('text-yellow-500 stroke-yellow-500')
  })

  it('returns orange ring for scores >= 50', () => {
    expect(scoreRingColor(55)).toBe('text-orange-500 stroke-orange-500')
  })

  it('returns red ring for scores < 50', () => {
    expect(scoreRingColor(30)).toBe('text-red-500 stroke-red-500')
  })
})

describe('scoreRgb', () => {
  it('returns green RGB for scores >= 90', () => {
    expect(scoreRgb(92)).toEqual([34, 197, 94])
  })

  it('returns yellow RGB for scores >= 70', () => {
    expect(scoreRgb(80)).toEqual([234, 179, 8])
  })

  it('returns orange RGB for scores >= 50', () => {
    expect(scoreRgb(60)).toEqual([249, 115, 22])
  })

  it('returns red RGB for scores < 50', () => {
    expect(scoreRgb(40)).toEqual([239, 68, 68])
  })
})

// ── F-024: Category Label Utility ──

describe('categoryLabel', () => {
  it('maps all 7 categories correctly', () => {
    expect(categoryLabel('meta')).toBe('Meta Tags')
    expect(categoryLabel('social')).toBe('Social Sharing')
    expect(categoryLabel('indexability')).toBe('Indexability')
    expect(categoryLabel('performance')).toBe('Performance')
    expect(categoryLabel('accessibility')).toBe('Accessibility')
    expect(categoryLabel('security')).toBe('Security')
    expect(categoryLabel('structure')).toBe('Site Structure')
  })

  it('returns slug as-is for unknown categories', () => {
    expect(categoryLabel('unknown')).toBe('unknown')
    expect(categoryLabel('custom')).toBe('custom')
  })
})

// ── F-025: Count By Status Utility ──

describe('countByStatus', () => {
  it('counts pass, fail, warn correctly', () => {
    const checks: AuditCheck[] = [
      { id: '1', category: 'meta', name: 'T1', status: 'pass', description: '' },
      { id: '2', category: 'meta', name: 'T2', status: 'fail', description: '' },
      { id: '3', category: 'meta', name: 'T3', status: 'warn', description: '' },
      { id: '4', category: 'meta', name: 'T4', status: 'pass', description: '' },
      { id: '5', category: 'meta', name: 'T5', status: 'fail', description: '' },
    ]
    expect(countByStatus(checks)).toEqual({ pass: 2, fail: 2, warn: 1 })
  })

  it('ignores skip status', () => {
    const checks: AuditCheck[] = [
      { id: '1', category: 'meta', name: 'T1', status: 'skip', description: '' },
      { id: '2', category: 'meta', name: 'T2', status: 'pass', description: '' },
    ]
    expect(countByStatus(checks)).toEqual({ pass: 1, fail: 0, warn: 0 })
  })

  it('returns zeros for empty array', () => {
    expect(countByStatus([])).toEqual({ pass: 0, fail: 0, warn: 0 })
  })
})

// ── F-026: Fetch With Timeout Utility ──

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns response on success', async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    const result = await fetchWithTimeout('https://example.com', { method: 'GET' })
    expect(result.status).toBe(200)
  })

  it('passes abort signal to fetch', async () => {
    const mockResponse = new Response('ok')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse)

    await fetchWithTimeout('https://example.com', { method: 'GET' }, 5000)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
})

// ── F-027: Build Auth Headers Utility ──

describe('buildAuthHeaders', () => {
  it('always includes Content-Type', async () => {
    const headers = await buildAuthHeaders()
    expect(headers['Content-Type']).toBe('application/json')
  })
})
