import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3001';
const DIR = './test-screenshots';
mkdirSync(DIR, { recursive: true });

const pages = [
  // Public pages
  ['01-landing-top', '/'],
  ['02-landing-howitworks', '/', { scrollTo: 900 }],
  ['03-landing-comparison', '/', { scrollToBottom: true }],
  ['04-pricing-top', '/pricing'],
  ['05-pricing-cards', '/pricing', { scrollTo: 500 }],
  ['06-pricing-faq', '/pricing', { scrollToBottom: true }],
  ['07-impressum', '/impressum'],
  ['08-impressum-bottom', '/impressum', { scrollToBottom: true }],
  ['09-privacy-top', '/privacy'],
  ['10-privacy-mid', '/privacy', { scrollTo: 800 }],
  ['11-privacy-bottom', '/privacy', { scrollToBottom: true }],
  ['12-terms-top', '/terms'],
  ['13-terms-bottom', '/terms', { scrollToBottom: true }],
  ['14-reset-password', '/reset-password'],
  // Authenticated pages (screenshot mode provides mock user)
  ['15-dashboard', '/dashboard'],
  ['16-dashboard-bottom', '/dashboard', { scrollToBottom: true }],
  // Error pages
  ['17-not-found', '/nonexistent-page-404'],
];

async function screenshotPage(context, name, path, opts = {}) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    if (opts.scrollTo) {
      await page.evaluate((y) => window.scrollTo(0, y), opts.scrollTo);
      await page.waitForTimeout(300);
    } else if (opts.scrollToBottom) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: false });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

(async () => {
  console.log('Starting Playwright screenshot audit at 430x932 (dark mode)...\n');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    colorScheme: 'dark',
  });
  for (const [name, path, opts] of pages) {
    await screenshotPage(ctx, name, path, opts);
  }
  await ctx.close();
  await browser.close();
  console.log('\nDone. Screenshots saved to ./test-screenshots/');
})();
