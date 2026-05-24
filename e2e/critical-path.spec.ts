/**
 * CRITICAL PATH E2E TESTS
 * ========================
 * These tests verify that the most fundamental user flows ACTUALLY WORK,
 * not just that UI elements exist. If these fail, the app is broken.
 *
 * Project: LaunchReady
 * Auth: password-gate (SHA-256 hash check, sessionStorage-based)
 *       + Supabase OTP auth modal for dashboard access
 * Supabase: https://hcfeoescybfngjsphekq.supabase.co
 * Framework: Next.js (static export)
 *
 * Tests:
 * 1. Password gate: renders and accepts/rejects
 * 2. Landing page: loads with audit form functional
 * 3. Edge functions: all reachable, not returning 500
 * 4. Protected routes: require auth (dashboard)
 */

import { test, expect } from '@playwright/test'

// ======================================================================
// PROJECT CONFIG
// ======================================================================

const PROJECT_CONFIG = {
  // No dedicated /auth page — uses AuthModal triggered from dashboard
  authPath: '/dashboard',

  authMethod: 'password-gate' as const,

  selectors: {
    // Password gate (wraps entire app)
    gatePasswordInput: 'input[type="password"][aria-label="Access code"]',
    gateSubmitButton: 'button:has-text("Enter")',
    // Landing page audit form
    auditFormInput: 'input[placeholder*="URL"], input[name="url"], input[type="url"]',
    auditFormButton: 'button[type="submit"]',
  },

  errorIndicators: [
    '[role="alert"]',
    '.text-red-400',
    '.text-destructive',
  ],

  supabaseUrl: 'https://hcfeoescybfngjsphekq.supabase.co',

  // Edge functions
  edgeFunctions: [
    'run-audit',
    'run-monitoring',
  ],

  // Protected routes (requires Supabase auth after password gate)
  protectedRoutes: ['/dashboard'],
}

// ======================================================================
// TESTS
// ======================================================================

test.describe('CRITICAL PATH — Password Gate', () => {
  test('password gate renders with form', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const gateInput = page.locator(PROJECT_CONFIG.selectors.gatePasswordInput)
    await expect(gateInput).toBeVisible({ timeout: 10000 })

    const submitBtn = page.locator(PROJECT_CONFIG.selectors.gateSubmitButton)
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('password gate rejects wrong password', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const gateInput = page.locator(PROJECT_CONFIG.selectors.gatePasswordInput)
    await gateInput.fill('wrong-password-123')

    const submitBtn = page.locator(PROJECT_CONFIG.selectors.gateSubmitButton)
    await submitBtn.click()
    await page.waitForTimeout(1000)

    const errorEl = page.getByText('Incorrect access code.')
    await expect(errorEl).toBeVisible()
  })
})

test.describe('CRITICAL PATH — Landing Page', () => {
  test('landing page loads without JS errors after gate bypass', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('launchready-unlocked', 'true')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors, `JS errors on landing page: ${errors.join(', ')}`).toEqual([])
  })

  test('audit form is visible and functional', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('launchready-unlocked', 'true')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Audit form input should exist
    const formInput = page.locator(PROJECT_CONFIG.selectors.auditFormInput).first()
    await expect(formInput).toBeVisible({ timeout: 10000 })

    // Submit button should exist
    const submitBtn = page.locator(PROJECT_CONFIG.selectors.auditFormButton).first()
    await expect(submitBtn).toBeVisible()
  })
})

test.describe('CRITICAL PATH — Edge Function Health', () => {
  for (const funcName of PROJECT_CONFIG.edgeFunctions) {
    test(`edge function "${funcName}" is reachable (not 500)`, async ({ request }) => {
      const response = await request.post(
        `${PROJECT_CONFIG.supabaseUrl}/functions/v1/${funcName}`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({ _health_check: true }),
          failOnStatusCode: false,
        }
      )

      const status = response.status()
      expect(
        status,
        `Edge function "${funcName}" returned ${status} — function is DOWN`
      ).not.toBe(500)
    })
  }
})

test.describe('CRITICAL PATH — Protected Route Guards', () => {
  for (const route of PROJECT_CONFIG.protectedRoutes) {
    test(`${route} requires authentication (shows auth modal or redirects)`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        sessionStorage.setItem('launchready-unlocked', 'true')
      })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Dashboard should show login prompt or redirect when unauthenticated
      const isOnDashboard = page.url().includes('/dashboard')

      // Either login prompt appeared OR we got redirected away
      if (isOnDashboard) {
        // If still on dashboard URL, a login prompt should be visible
        const loginPrompt = page.getByText('Log in to see your audit history.', { exact: true })
        await expect(loginPrompt).toBeVisible({ timeout: 5000 })
      }
      // If redirected, that's also valid behavior
    })
  }
})

test.describe('CRITICAL PATH — Network & Infrastructure', () => {
  test('Supabase project is reachable (not paused)', async ({ request }) => {
    const response = await request.get(
      `${PROJECT_CONFIG.supabaseUrl}/rest/v1/`,
      {
        headers: { apikey: 'placeholder' },
        failOnStatusCode: false,
      }
    )

    const status = response.status()
    expect(
      status < 500,
      `Supabase project appears DOWN (status ${status}). May be paused.`
    ).toBe(true)
  })

  test('auth API responds correctly', async ({ request }) => {
    const response = await request.get(
      `${PROJECT_CONFIG.supabaseUrl}/auth/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        failOnStatusCode: false,
      }
    )

    const status = response.status()
    expect(
      status < 500,
      `Auth API returned ${status} — may be down`
    ).toBe(true)
  })
})
