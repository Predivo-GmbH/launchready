import { test, expect, type Page } from '@playwright/test'

const GATE_PASSWORD = 'predivo2026'

// All public pages to test
const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/impressum', name: 'Impressum' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/reset-password', name: 'Reset Password' },
]

// Collect console errors
function trackConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

// Bypass the PasswordGate by injecting sessionStorage before any navigation
async function bypassGate(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('launchready-unlocked', 'true')
  })
}

// Unlock the PasswordGate via the actual UI (for gate-specific tests)
async function unlockGate(page: Page) {
  await page.goto('/')
  const gateInput = page.getByPlaceholder('Enter access code')
  if (await gateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await gateInput.fill(GATE_PASSWORD)
    await page.getByRole('button', { name: 'Enter' }).click()
    await page.locator('header').waitFor({ state: 'visible', timeout: 10000 })
  }
}

// Navigate to a page (gate already bypassed via addInitScript)
async function gotoPage(page: Page, path: string) {
  await page.goto(path)
  await page.locator('header').waitFor({ state: 'visible', timeout: 10000 })
}

// ─── PasswordGate ────────────────────────────────────────────
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

  test('unlocks with correct password', async ({ page }) => {
    await unlockGate(page)
    // Should see the header with LaunchReady branding
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 })
    // Should see the main content h1
    const h1 = page.locator('section h1, main h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })
  })
})

// ─── All Pages: Load, No Errors, Screenshots ────────────────
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

      // Screenshot for visual review
      await page.screenshot({
        path: `e2e/screenshots/${p.name.toLowerCase().replace(/\s/g, '-')}-desktop.png`,
        fullPage: true,
      })

      // No JS console errors (filter dev warnings & Supabase auth noise)
      const realErrors = errors.filter(
        (e) =>
          !e.includes('Warning:') &&
          !e.includes('DevTools') &&
          !e.includes('Failed to fetch') &&
          !e.includes('ERR_CONNECTION_REFUSED') &&
          !e.includes('FetchError') &&
          !e.includes('AbortError')
      )
      expect(realErrors).toEqual([])
    })
  }
})

// ─── Mobile Screenshots ─────────────────────────────────────
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  for (const p of [PAGES[0], PAGES[1], PAGES[2]]) {
    test(`${p.name} — mobile screenshot`, async ({ page }) => {
      await gotoPage(page, p.path)
      await page.screenshot({
        path: `e2e/screenshots/${p.name.toLowerCase().replace(/\s/g, '-')}-mobile.png`,
        fullPage: true,
      })
      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
    })
  }
})

// ─── Homepage Specifics ──────────────────────────────────────
test.describe('Homepage', () => {
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
    const urlInput = page.getByLabel('Website URL')
    await expect(urlInput).toBeVisible()
    const auditBtn = page.getByRole('button', { name: 'Audit' })
    await expect(auditBtn).toBeVisible()
  })

  test('How It Works section exists', async ({ page }) => {
    const howSection = page.locator('#how-it-works')
    await expect(howSection).toBeAttached()
  })

  test('footer has correct links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.locator('a[href="/pricing"]')).toBeVisible()
    await expect(footer.locator('a[href="/impressum"]')).toBeVisible()
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible()
    await expect(footer.locator('a[href="/terms"]')).toBeVisible()
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
})

// ─── Pricing Page ────────────────────────────────────────────
test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
    await gotoPage(page, '/pricing')
  })

  test('shows 3 plan tiers', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Free' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Starter' })).toBeVisible()
    await expect(page.locator('h2').filter({ hasText: 'Pro' })).toBeVisible()
  })

  test('shows prices', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$19')).toBeVisible()
    await expect(page.getByText('$39')).toBeVisible()
  })

  test('has FAQ section', async ({ page }) => {
    await expect(page.locator('h3').filter({ hasText: 'Frequently Asked Questions' })).toBeVisible()
  })

  test('FAQ JSON-LD is present', async ({ page }) => {
    const jsonLd = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]')
      return script ? JSON.parse(script.textContent!) : null
    })
    expect(jsonLd).not.toBeNull()
    expect(jsonLd['@type']).toBe('FAQPage')
  })

  test('paid plan buttons are disabled (Coming Soon)', async ({ page }) => {
    const disabledButtons = page.locator('button:disabled')
    const count = await disabledButtons.count()
    expect(count).toBe(2)
  })
})

// ─── Dashboard (Unauthenticated) ────────────────────────────
test.describe('Dashboard — Not Logged In', () => {
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

// ─── Legal Pages ─────────────────────────────────────────────
test.describe('Legal Pages', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('Impressum has company details', async ({ page }) => {
    await gotoPage(page, '/impressum')
    await expect(page.getByText('Predivo GmbH').first()).toBeVisible()
  })

  test('Privacy page renders content', async ({ page }) => {
    await gotoPage(page, '/privacy')
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('Terms page renders content', async ({ page }) => {
    await gotoPage(page, '/terms')
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })
})

// ─── Header & Navigation ────────────────────────────────────
test.describe('Header & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('header is sticky and visible after scroll', async ({ page }) => {
    await gotoPage(page, '/')
    const header = page.locator('header')
    await expect(header).toBeVisible()

    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(300)
    await expect(header).toBeVisible()
  })

  test('desktop nav has correct links', async ({ page }) => {
    await gotoPage(page, '/')
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav.locator('a[href="/pricing"]')).toBeVisible()
    await expect(nav.locator('a[href="/#how-it-works"]')).toBeVisible()
  })

  test('pricing link navigates correctly', async ({ page }) => {
    await gotoPage(page, '/')
    await page.locator('nav[aria-label="Main navigation"] a[href="/pricing"]').click()
    await page.waitForURL('**/pricing')
    await page.locator('header').waitFor({ state: 'visible', timeout: 5000 })
    await expect(page.locator('h1')).toContainText('pricing')
  })
})

// ─── Accessibility Basics ────────────────────────────────────
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await bypassGate(page)
  })

  test('skip-to-content link exists', async ({ page }) => {
    await gotoPage(page, '/')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
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

  test('footer navigation has aria-label', async ({ page }) => {
    await gotoPage(page, '/')
    const footerNav = page.locator('nav[aria-label="Footer navigation"]')
    await expect(footerNav).toBeAttached()
  })

  test('main content landmark exists', async ({ page }) => {
    await gotoPage(page, '/')
    const main = page.locator('main#main-content')
    await expect(main).toBeAttached()
  })

  test('audit form input has accessible label', async ({ page }) => {
    await gotoPage(page, '/')
    const input = page.getByLabel('Website URL')
    await expect(input).toBeVisible()
  })
})
