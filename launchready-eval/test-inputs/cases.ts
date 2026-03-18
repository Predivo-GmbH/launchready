/**
 * Test cases for LaunchReady AI fix generation evaluation.
 *
 * Each case has:
 * - A realistic HTML <head> section
 * - A set of failed checks the AI must generate fixes for
 * - Expected validation criteria per fix
 */

export interface FailedCheck {
  id: string
  category: string
  name: string
  description: string
}

export interface TestCase {
  id: string
  name: string
  url: string
  html: string
  failedChecks: FailedCheck[]
  expectedFixCount: number
}

export const TEST_CASES: TestCase[] = [
  {
    id: 'T1',
    name: 'SaaS site missing meta + social tags',
    url: 'https://acme-saas.com',
    failedChecks: [
      { id: 'meta-description', category: 'meta', name: 'Meta Description', description: 'Page is missing a meta description tag' },
      { id: 'og-title', category: 'social', name: 'Open Graph Title', description: 'Missing og:title meta tag' },
      { id: 'og-description', category: 'social', name: 'Open Graph Description', description: 'Missing og:description meta tag' },
      { id: 'og-image', category: 'social', name: 'Open Graph Image', description: 'Missing og:image meta tag' },
      { id: 'twitter-card', category: 'social', name: 'Twitter Card', description: 'Missing twitter:card meta tag' },
    ],
    expectedFixCount: 5,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Acme SaaS — Project Management for Growing Teams</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" href="/favicon.ico">
</head>`,
  },

  {
    id: 'T2',
    name: 'Blog missing sitemap + robots + JSON-LD',
    url: 'https://example-blog.com',
    failedChecks: [
      { id: 'sitemap-exists', category: 'indexability', name: 'Sitemap', description: 'No sitemap.xml found at /sitemap.xml' },
      { id: 'robots-txt', category: 'indexability', name: 'Robots.txt', description: 'No robots.txt found at /robots.txt' },
      { id: 'jsonld', category: 'structure', name: 'JSON-LD Structured Data', description: 'No JSON-LD structured data found on the page' },
    ],
    expectedFixCount: 3,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The Daily Grind — Coffee Culture & Brewing Tips</title>
  <meta name="description" content="Explore the world of specialty coffee. Brewing guides, bean reviews, and café culture from around the globe.">
  <link rel="canonical" href="https://example-blog.com/">
  <meta property="og:title" content="The Daily Grind">
  <meta property="og:type" content="website">
</head>`,
  },

  {
    id: 'T3',
    name: 'E-commerce missing canonical + JSON-LD + security headers',
    url: 'https://shop.example.com/products/widget-pro',
    failedChecks: [
      { id: 'meta-canonical', category: 'meta', name: 'Canonical URL', description: 'Page is missing a canonical URL link tag' },
      { id: 'jsonld', category: 'structure', name: 'JSON-LD Structured Data', description: 'No JSON-LD structured data found on the page' },
      { id: 'header-xcto', category: 'security', name: 'X-Content-Type-Options', description: 'Missing X-Content-Type-Options: nosniff header' },
      { id: 'header-xfo', category: 'security', name: 'X-Frame-Options', description: 'Missing X-Frame-Options header' },
    ],
    expectedFixCount: 4,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Widget Pro — Premium Widgets | Example Shop</title>
  <meta name="description" content="The Widget Pro is our flagship product. Built with precision engineering and available in 5 colors. Free shipping on orders over $50.">
  <meta property="og:title" content="Widget Pro — Premium Widgets">
  <meta property="og:image" content="https://shop.example.com/images/widget-pro.jpg">
  <link rel="stylesheet" href="/assets/shop.css">
</head>`,
  },

  {
    id: 'T4',
    name: 'Portfolio missing viewport + H1 + meta description',
    url: 'https://janedoe-design.com',
    failedChecks: [
      { id: 'viewport', category: 'accessibility', name: 'Viewport Meta Tag', description: 'Page is missing the viewport meta tag for mobile responsiveness' },
      { id: 'heading-h1', category: 'structure', name: 'H1 Heading', description: 'Page is missing an H1 heading element' },
      { id: 'meta-description', category: 'meta', name: 'Meta Description', description: 'Page is missing a meta description tag' },
    ],
    expectedFixCount: 3,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Jane Doe — UX Designer & Illustrator</title>
  <link rel="stylesheet" href="/portfolio.css">
  <link rel="icon" type="image/png" href="/favicon.png">
  <meta property="og:title" content="Jane Doe Design Portfolio">
  <meta property="og:image" content="https://janedoe-design.com/og.png">
</head>`,
  },

  {
    id: 'T5',
    name: 'Minimal site missing almost everything',
    url: 'https://startup-mvp.io',
    failedChecks: [
      { id: 'meta-description', category: 'meta', name: 'Meta Description', description: 'Page is missing a meta description tag' },
      { id: 'meta-canonical', category: 'meta', name: 'Canonical URL', description: 'Page is missing a canonical URL link tag' },
      { id: 'og-title', category: 'social', name: 'Open Graph Title', description: 'Missing og:title meta tag' },
      { id: 'og-description', category: 'social', name: 'Open Graph Description', description: 'Missing og:description meta tag' },
      { id: 'og-image', category: 'social', name: 'Open Graph Image', description: 'Missing og:image meta tag' },
      { id: 'sitemap-exists', category: 'indexability', name: 'Sitemap', description: 'No sitemap.xml found at /sitemap.xml' },
      { id: 'jsonld', category: 'structure', name: 'JSON-LD Structured Data', description: 'No JSON-LD structured data found on the page' },
    ],
    expectedFixCount: 7,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LaunchPad — Ship Your MVP in 48 Hours</title>
  <link rel="stylesheet" href="/app.css">
</head>`,
  },
]
