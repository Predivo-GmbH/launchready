# LaunchReady — Project Overview

> **Last updated:** 26 March 2026
> **Status:** MVP (behind PasswordGate — private beta)
> **Live:** https://launchready.predivo.ch

---

## What

Post-launch website audit SaaS. Paste a URL, get a 17-check scored audit with AI-generated copy-paste fix code — in 60 seconds. Free, no signup required for anonymous users (rate-limited).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (static export) + React 19 + TypeScript 5.9 + Tailwind CSS 4 |
| Backend | Supabase Edge Functions (Deno) |
| AI | Claude Sonnet (fix code generation via Anthropic API) |
| Auth | Supabase Auth (OTP/magic link + password) |
| Database | Supabase Postgres (audits, user_plans, monitored_sites) |
| PDF Export | jsPDF (lazy-loaded) |
| Deploy | GitHub Actions → Playwright e2e → FTP to Metanet |
| Hosting | Metanet (launchready.predivo.ch) |

## Repo & Infrastructure

| Item | Value |
|------|-------|
| GitHub | `https://github.com/Arivioo/launchready` (private) |
| Branch | `master` |
| Commits | 32 |
| Supabase project | `hcfeoescybfngjsphekq` |
| Supabase account | supabase@launchready.predivo.ch |
| Supabase plan | Free |

---

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing page (hero, how-it-works, comparison table, audit form) |
| `/pricing` | 3-tier pricing (Free / Starter $19/mo / Pro $39/mo) |
| `/dashboard` | Auth-gated: audit history, monitoring, PDF export |
| `/reset-password` | Password reset flow |
| `/impressum` | Legal: Impressum |
| `/privacy` | Legal: Privacy Policy |
| `/terms` | Legal: Terms of Service |
| `404` | Custom not-found page |

---

## Audit Engine (17 checks, 7 categories)

| Category | Checks |
|----------|--------|
| Meta Tags | title, description, canonical |
| Social Sharing | og:title, og:description, og:image, og:url, twitter:card |
| Indexability | sitemap.xml (with lastmod), robots.txt (with sitemap ref) |
| Structure | H1 heading, JSON-LD structured data |
| Accessibility | image alt text, viewport meta |
| Security | X-Content-Type-Options, X-Frame-Options, HTTPS |

**AI Fix Generation:** For paid users, Claude Sonnet generates copy-paste fix code + plain-English explanations for every failed check.

---

## Pricing Tiers

| Tier | Price | Audits/mo | AI Fix Code | PDF Export | Monitoring |
|------|-------|-----------|-------------|------------|------------|
| Free | $0 | 1 | Blurred | No | No |
| Starter | $19/mo | 10 | Yes | No | No |
| Pro | $39/mo | Unlimited | Yes | Yes | Weekly re-audits |

---

## Edge Functions

### `run-audit`
- Fetches and parses target URL with Cheerio
- Runs 17 checks across 7 categories
- CORS: production-only origins (configurable via `IS_PRODUCTION` env var)
- Rate limiting: 5 requests/hour per IP for anonymous users
- SSRF protection: blocks private/internal URLs
- Free plan: server-side 1 audit/month enforcement, fix code stripped
- Paid plan: AI fix generation via Anthropic API

### `run-monitoring`
- Called weekly by GitHub Actions cron (Sundays 06:00 UTC)
- Re-audits all active monitored sites for Pro users
- Updates scores and stores audit history
- Requires `CRON_SECRET` bearer token

---

## Auth System

- Supabase Auth with 6-digit OTP (600s expiry)
- Signup: email → OTP verification → optional password setup
- Login: magic link/OTP or password
- Forgot password: reset link via email
- Custom SMTP: noreply@predivo.ch (Metanet, tertia.sui-inter.net:465)
- 5 branded email templates (dark theme: zinc-900 bg, blue-600 accent)

---

## CI/CD Pipeline

```
push to master
  → npm ci
  → next build (static export)
  → Playwright install + run 36 e2e tests (against static export via `serve`)
  → FTP deploy to launchready.predivo.ch (zero-downtime: assets first, then full mirror)
```

**Additional workflows:**
- `keep-alive.yml` — Daily Supabase ping (prevents free-tier pausing)
- `monitoring-cron.yml` — Weekly Sunday 06:00 UTC, calls `run-monitoring` edge function

---

## QA & Testing

- **Playwright e2e:** 36 tests (all pages, PasswordGate, mobile, accessibility, navigation, console errors)
- **ESLint 9:** `eslint-config-next/core-web-vitals` flat config
- **Tests run in CI/CD** before every deploy

---

## SEO

- `metadataBase` + automatic canonical URLs via Next.js metadata API
- Self-hosted Inter font via `next/font/google` (no render-blocking external fonts)
- OG metadata on all pages (including legal pages)
- Twitter Card metadata (summary_large_image)
- Sitemap.xml with lastmod dates
- robots.txt with sitemap reference
- `.htaccess` caching: 1 year immutable for JS/CSS/fonts, 1 hour for HTML
- Internal `<a>` tags converted to Next.js `<Link>` for client-side navigation

---

## Accessibility

- AuthModal focus trap (Tab/Shift+Tab cycling within dialog, focus restored on close)
- Mobile menu: Escape closes, auto-focus first item, return focus to hamburger
- Skip-to-content link
- aria-labels on password inputs, footer nav, dialog
- All images checked for alt text

---

## Performance

- Initial JS: **246KB gzipped** (Next.js + React + Supabase framework)
- jsPDF (418KB raw): **lazy-loaded** on demand (not in initial bundle)
- Static export: all pages pre-rendered as HTML

---

## Brand

| Asset | Value |
|-------|-------|
| Primary color | Blue #2563EB (blue-600) |
| Theme | Dark (zinc-950 bg, white text) |
| Logo | Lucide Zap icon + "LaunchReady" text |
| Font | Inter (self-hosted via next/font/google) |
| Favicon | Custom SVG |
| OG Image | 1200x630 PNG |

---

## What's Done (complete)

- 17-check audit engine with scoring
- AI fix code generation (Claude Sonnet)
- Full auth system (OTP + password + reset)
- Dashboard with audit history
- PDF export (jsPDF, lazy-loaded)
- Monitoring infrastructure (DB schema + edge function + cron)
- 3-tier pricing page (UI complete)
- Legal pages with OG metadata
- Playwright e2e (36 tests) in CI/CD
- ESLint configuration
- SEO (canonical, OG, Twitter, sitemap, caching)
- Accessibility (focus trap, skip link, aria labels)
- Edge functions deployed (CORS, rate limiting, SSRF protection)
- Production deployment pipeline (build → test → FTP)

## What's Open

| Item | Priority | Notes |
|------|----------|-------|
| Stripe integration | High | Paid tier buttons show "Coming Soon" — no payment processor |
| Remove PasswordGate | High | Site behind beta gate — remove when ready to go public |
| Multi-page crawl | Medium | Currently audits single page only |
| `IS_PRODUCTION` env var | Low | Not set in Supabase secrets (defaults to production mode, safe) |
