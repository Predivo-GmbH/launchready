import { test, expect, type Page } from '@playwright/test'

/**
 * Feature E2E tests: validate user journeys for each feature.
 * Covers: F-001 through F-022
 */

async function bypassGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('launchready-unlocked', 'true')
  })
}

async function gotoPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('header').waitFor({ state: 'visible', timeout: 10000 })
}

async function isMobile(page: Page): Promise<boolean> {
  const viewport = page.viewportSize()
  return (viewport?.width ?? 1280) < 640
}

async function openMobileMenu(page: Page) {
  const hamburger = page.getByLabel('Open menu')
  await hamburger.click()
  await page.locator('nav[aria-label="Mobile navigation"]').waitFor({ state: 'visible', timeout: 5000 })
}

function getNav(page: Page, mobile: boolean) {
  return mobile
    ? page.locator('nav[aria-label="Mobile navigation"]')
    : page.locator('nav[aria-label="Main navigation"]')
}

// ── F-001: Landing Page ──
test.describe('F-001: Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/')
  })

  test('has correct headline', async ({ page }) => {
    const headline = page.locator('section#audit h1')
    await expect(headline).toBeVisible()
    await expect(headline).toContainText('Your website is live')
  })

  test('audit form has URL input and submit button', async ({ page }) => {
    await expect(page.getByLabel('Website URL')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Audit' })).toBeVisible()
  })

  test('has category badges', async ({ page }) => {
    await expect(page.getByText('Meta tags')).toBeVisible()
    await expect(page.getByText('JSON-LD schema')).toBeVisible()
    await expect(page.getByText('Security headers')).toBeVisible()
  })

  test('JSON-LD structured data is present', async ({ page }) => {
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      return script ? JSON.parse(script.textContent!) : null
    })
    expect(jsonLd).not.toBeNull()
    expect(jsonLd['@type']).toBe('SoftwareApplication')
    expect(jsonLd.name).toBe('LaunchReady')
  })

  test('free audit badge visible', async ({ page }) => {
    await expect(page.getByText('Free audit — no signup required')).toBeVisible()
  })
})

// ── F-002: How It Works ──
test.describe('F-002: How It Works', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/')
  })

  test('section exists', async ({ page }) => {
    await expect(page.locator('#how-it-works')).toBeAttached()
  })

  test('has 4 steps', async ({ page }) => {
    await expect(page.getByText('Paste your URL')).toBeVisible()
    await expect(page.getByText('We audit everything')).toBeVisible()
    await expect(page.getByText('Get copy-paste fixes')).toBeVisible()
    await expect(page.getByText('Get found on Google')).toBeVisible()
  })
})

// ── F-003: Comparison Table ──
test.describe('F-003: Comparison Table', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/')
  })

  test('renders comparison heading', async ({ page }) => {
    await expect(page.getByText('Why not just use Lighthouse or Semrush?')).toBeVisible()
  })

  test('has price row', async ({ page }) => {
    await expect(page.getByText('From $19/mo')).toBeVisible()
  })
})

// ── F-004: Pricing Page ──
test.describe('F-004: Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/pricing')
  })

  test('shows 3 plan tiers', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Free' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Starter' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Pro' })).toBeVisible()
  })

  test('shows correct prices', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$19')).toBeVisible()
    await expect(page.getByText('$39')).toBeVisible()
  })

  test('has FAQ section with JSON-LD', async ({ page }) => {
    await expect(page.locator('h3').filter({ hasText: 'Frequently Asked Questions' })).toBeVisible()
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      return script ? JSON.parse(script.textContent!) : null
    })
    expect(jsonLd).not.toBeNull()
    expect(jsonLd['@type']).toBe('FAQPage')
  })

  test('paid plan buttons are disabled', async ({ page }) => {
    const disabledButtons = page.locator('button:disabled')
    const count = await disabledButtons.count()
    expect(count).toBe(2)
  })
})

// ── F-005: Audit Form Validation ──
test.describe('F-005: Audit Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/')
  })

  test('audit button is disabled when empty', async ({ page }) => {
    const auditBtn = page.getByRole('button', { name: 'Audit' })
    await expect(auditBtn).toBeDisabled()
  })

  test('audit button enables when URL is entered', async ({ page }) => {
    await page.getByLabel('Website URL').fill('example.com')
    const auditBtn = page.getByRole('button', { name: 'Audit' })
    await expect(auditBtn).not.toBeDisabled()
  })
})

// ── F-009: Auth Modal ──
test.describe('F-009: Auth Modal', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/')
  })

  test('opens login modal from header', async ({ page }) => {
    const mobile = await isMobile(page)
    if (mobile) await openMobileMenu(page)
    const nav = getNav(page, mobile)
    await nav.getByText('Log in').click()
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('opens signup modal from header', async ({ page }) => {
    const mobile = await isMobile(page)
    if (mobile) await openMobileMenu(page)
    const nav = getNav(page, mobile)
    await nav.getByText('Sign up').click()
    await expect(page.getByText('Create account')).toBeVisible()
  })

  test('closes modal with close button', async ({ page }) => {
    const mobile = await isMobile(page)
    if (mobile) await openMobileMenu(page)
    const nav = getNav(page, mobile)
    await nav.getByText('Log in').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel('Close dialog').click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})

// ── F-011: Dashboard (Unauthenticated) ──
test.describe('F-011: Dashboard (Not Logged In)', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('shows login prompt', async ({ page }) => {
    await gotoPage(page, '/dashboard')
    await expect(page.getByText('Log in to see your audit history.')).toBeVisible({ timeout: 10000 })
  })

  test('has Log in button', async ({ page }) => {
    await gotoPage(page, '/dashboard')
    await expect(page.locator('#main-content').getByRole('button', { name: 'Log in' })).toBeVisible({ timeout: 10000 })
  })
})

// ── F-015: Header Navigation ──
test.describe('F-015: Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('header stays visible after scroll', async ({ page }) => {
    await gotoPage(page, '/')
    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(300)
    await expect(page.locator('header')).toBeVisible()
  })

  test('desktop nav has correct links', async ({ page }) => {
    await gotoPage(page, '/')
    const mobile = await isMobile(page)
    if (mobile) await openMobileMenu(page)
    const nav = getNav(page, mobile)
    await expect(nav.locator('a[href="/pricing"]')).toBeVisible()
    await expect(nav.locator('a[href="/#how-it-works"]')).toBeVisible()
  })

  test('pricing link navigates correctly', async ({ page }) => {
    await gotoPage(page, '/')
    const mobile = await isMobile(page)
    if (mobile) await openMobileMenu(page)
    const nav = getNav(page, mobile)
    await nav.locator('a[href="/pricing"]').click()
    await page.waitForURL('**/pricing')
    await expect(page.locator('h1')).toContainText('pricing')
  })
})

// ── F-017: Layout & SEO ──
test.describe('F-017: Layout & SEO', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('skip-to-content link exists', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('a[href="#main-content"]')).toBeAttached()
  })

  test('main content landmark exists', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('main#main-content')).toBeAttached()
  })

  test('footer has navigation with correct links', async ({ page }) => {
    await gotoPage(page, '/')
    const footer = page.locator('footer')
    await expect(footer.locator('a[href="/pricing"]')).toBeVisible()
    await expect(footer.locator('a[href="/impressum"]')).toBeVisible()
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible()
    await expect(footer.locator('a[href="/terms"]')).toBeVisible()
  })

  test('footer navigation has aria-label', async ({ page }) => {
    await gotoPage(page, '/')
    await expect(page.locator('nav[aria-label="Footer navigation"]')).toBeAttached()
  })
})

// ── F-020: Impressum ──
test.describe('F-020: Impressum', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/impressum')
  })

  test('has company details', async ({ page }) => {
    await expect(page.getByText('Predivo GmbH').first()).toBeVisible()
    await expect(page.getByText('CHE-374.611.592')).toBeVisible()
  })

  test('has back link', async ({ page }) => {
    await expect(page.locator('main a[href="/"]')).toBeVisible()
  })
})

// ── F-021: Privacy ──
test.describe('F-021: Privacy', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/privacy')
  })

  test('has Privacy Policy heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Privacy Policy')
  })

  test('has contact email', async ({ page }) => {
    await expect(page.locator('a[href="mailto:hello@predivo.ch"]').first()).toBeVisible()
  })
})

// ── F-022: Terms ──
test.describe('F-022: Terms', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/terms')
  })

  test('has Terms of Service heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Terms of Service')
  })

  test('mentions Swiss law', async ({ page }) => {
    await expect(page.getByText('Swiss law')).toBeVisible()
  })
})
