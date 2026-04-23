import { describe, it, expect } from 'vitest'
import { PLAN_LIMITS, PLANS } from '@/lib/plans'
import type { PlanId } from '@/lib/plans'

// ── F-028: Plan Definitions & Limits ──

describe('PLAN_LIMITS', () => {
  it('has exactly 3 plan IDs', () => {
    const planIds = Object.keys(PLAN_LIMITS) as PlanId[]
    expect(planIds).toHaveLength(3)
    expect(planIds).toContain('free')
    expect(planIds).toContain('starter')
    expect(planIds).toContain('pro')
  })

  describe('Free plan', () => {
    const free = PLAN_LIMITS.free

    it('allows 1 audit per month', () => {
      expect(free.auditsPerMonth).toBe(1)
    })

    it('shows max 5 issues', () => {
      expect(free.maxIssuesShown).toBe(5)
    })

    it('does not show fix code', () => {
      expect(free.showFixCode).toBe(false)
    })

    it('does not allow PDF export', () => {
      expect(free.pdfExport).toBe(false)
    })

    it('does not allow monitoring', () => {
      expect(free.monitoring).toBe(false)
      expect(free.maxMonitoredSites).toBe(0)
    })
  })

  describe('Starter plan', () => {
    const starter = PLAN_LIMITS.starter

    it('allows unlimited audits', () => {
      expect(starter.auditsPerMonth).toBe(-1)
    })

    it('shows all issues', () => {
      expect(starter.maxIssuesShown).toBe(-1)
    })

    it('shows fix code', () => {
      expect(starter.showFixCode).toBe(true)
    })

    it('does not allow PDF export', () => {
      expect(starter.pdfExport).toBe(false)
    })

    it('does not allow monitoring', () => {
      expect(starter.monitoring).toBe(false)
    })
  })

  describe('Pro plan', () => {
    const pro = PLAN_LIMITS.pro

    it('allows unlimited audits', () => {
      expect(pro.auditsPerMonth).toBe(-1)
    })

    it('shows all issues', () => {
      expect(pro.maxIssuesShown).toBe(-1)
    })

    it('shows fix code', () => {
      expect(pro.showFixCode).toBe(true)
    })

    it('allows PDF export', () => {
      expect(pro.pdfExport).toBe(true)
    })

    it('allows monitoring with 5 sites', () => {
      expect(pro.monitoring).toBe(true)
      expect(pro.maxMonitoredSites).toBe(5)
    })
  })
})

describe('PLANS', () => {
  it('has 3 plans', () => {
    expect(PLANS).toHaveLength(3)
  })

  it('has correct plan IDs in order', () => {
    expect(PLANS.map(p => p.id)).toEqual(['free', 'starter', 'pro'])
  })

  it('has correct prices', () => {
    expect(PLANS[0].price).toBe('$0')
    expect(PLANS[1].price).toBe('$19')
    expect(PLANS[2].price).toBe('$39')
  })

  it('has Starter as highlighted plan', () => {
    expect(PLANS[0].highlighted).toBeFalsy()
    expect(PLANS[1].highlighted).toBe(true)
    expect(PLANS[2].highlighted).toBeFalsy()
  })

  it('has features list for each plan', () => {
    for (const plan of PLANS) {
      expect(plan.features.length).toBeGreaterThan(0)
    }
  })

  it('has CTAs for each plan', () => {
    expect(PLANS[0].cta).toBe('Get Started')
    expect(PLANS[1].cta).toBe('Coming Soon')
    expect(PLANS[2].cta).toBe('Coming Soon')
  })

  it('has price notes for paid plans', () => {
    expect(PLANS[0].priceNote).toBeUndefined()
    expect(PLANS[1].priceNote).toBe('/month')
    expect(PLANS[2].priceNote).toBe('/month')
  })
})
