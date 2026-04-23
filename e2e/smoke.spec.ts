import { test, expect, type Page } from '@playwright/test'

/**
 * Smoke tests: verify all routes load without JS errors.
 * Covers: F-001, F-004, F-010, F-011, F-015, F-016, F-017, F-020, F-021, F-022
 */

const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/impressum', name: 'Impressum' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/reset-password', name: 'Reset Password' },
]

function trackConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

async function bypassGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('launchready-unlocked', 'true')
  })
}

async function gotoPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('header').waitFor({ state: 'visible', timeout: 10000 })
}

// ── PasswordGate (F-016) ──
test.describe('PasswordGate', () => {
  test('shows gate on first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('This app is in private beta.')).toBeVisible()
    await expect(page.getByPlaceholder('Enter access code')).toBeVisible()
  })

  test('rejects wrong password', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Enter access code').fill('wrongpassword')
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByText('Incorrect access code.')).toBeVisible()
  })
})

// ── All Pages: Load, No Errors (F-017) ──
test.describe('Page Load & Console Errors', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  for (const p of PAGES) {
    test(`${p.name} (${p.path}) — loads without JS errors`, async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await gotoPage(page, p.path)

      // Page should not be blank
      const bodyText = await page.locator('body').textContent()
      expect(bodyText!.length).toBeGreaterThan(50)

      // No JS console errors (filter dev warnings & Supabase auth noise)
      const realErrors = errors.filter(
        (e) =>
          !e.includes('Warning:') &&
          !e.includes('DevTools') &&
          !e.includes('Failed to fetch') &&
          !e.includes('ERR_CONNECTION_REFUSED') &&
          !e.includes('FetchError') &&
          !e.includes('AbortError'),
      )
      expect(realErrors).toEqual([])
    })
  }
})

// ── Header presence on every page (F-015) ──
test.describe('Header visible on all pages', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  for (const p of PAGES) {
    test(`${p.name} has sticky header`, async ({ page }) => {
      await gotoPage(page, p.path)
      await expect(page.locator('header')).toBeVisible()
    })
  }
})

// ── Footer present on every page (F-017) ──
test.describe('Footer visible on all pages', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  for (const p of PAGES) {
    test(`${p.name} has footer`, async ({ page }) => {
      await gotoPage(page, p.path)
      await expect(page.locator('footer')).toBeVisible()
    })
  }
})
