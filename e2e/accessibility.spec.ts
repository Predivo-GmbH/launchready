import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility tests: axe-core WCAG 2.1 AA on all public routes.
 * Covers accessibility compliance across the application.
 */

const PUBLIC_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/impressum', name: 'Impressum' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/reset-password', name: 'Reset Password' },
]

async function bypassGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('launchready-unlocked', 'true')
  })
}

async function gotoPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('header').waitFor({ state: 'visible', timeout: 10000 })
}

test.describe('Accessibility — WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  for (const p of PUBLIC_PAGES) {
    test(`${p.name} (${p.path}) — passes axe-core checks`, async ({ page }) => {
      await gotoPage(page, p.path)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.animate-spin') // exclude loading spinners that may have transient states
        .analyze()

      // Report violations but allow minor issues
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      if (critical.length > 0) {
        const summary = critical
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.html).join('\n  ')}`,
          )
          .join('\n\n')
        console.error(`Accessibility issues on ${p.path}:\n${summary}`)
      }

      // Fail only on critical/serious violations
      expect(critical).toEqual([])
    })
  }
})

// ── Specific accessibility checks ──
test.describe('Accessibility — Manual Checks', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('all images have alt text', async ({ page }) => {
    await gotoPage(page, '/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `Image ${i} missing alt text`).toBeTruthy()
    }
  })

  test('audit form input has accessible label', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.getByLabel('Website URL')).toBeVisible()
  })

  test('skip-to-content link exists', async ({ page }) => {
    await gotoPage(page, '/')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
  })

  test('main landmark exists', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('main#main-content')).toBeAttached()
  })

  test('footer navigation has aria-label', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('nav[aria-label="Footer navigation"]')).toBeAttached()
  })

  test('header navigation has aria-label', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('nav[aria-label="Main navigation"]')).toBeAttached()
  })
})
