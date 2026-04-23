# LaunchReady Features Registry

Complete feature inventory for LaunchReady. Each feature includes: ID, name, route, description, components, critical assertions, and test file paths.

**Status Legend:** `implemented` = deployed and live | `tested` = feature has E2E/unit tests

---

## Landing & Public Pages

### F-001: Landing Page with Audit Form
- **Route:** `/`
- **Description:** Hero section with headline, URL input form, category badges, JSON-LD SoftwareApplication structured data. AuditForm submits URL to `run-audit` edge function. Displays AuditResults on completion.
- **Components:** Home (page.tsx), AuditForm, AuditResults, HowItWorks, Comparison
- **Edge Functions:** `run-audit`
- **Database Tables:** `audits`
- **Critical Assertions:** Headline visible | URL input accepts text | Audit button present | JSON-LD structured data in DOM | HowItWorks and Comparison sections render
- **Status:** tested
- **Test Files:** Unit: `src/components/landing/__tests__/HowItWorks.test.tsx` | Unit: `src/components/landing/__tests__/Comparison.test.tsx` | E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-002: How It Works Section
- **Route:** `/#how-it-works`
- **Description:** Four-step visual guide: Paste URL, Audit, Get Fixes, Get Found. Uses Lucide icons.
- **Components:** HowItWorks
- **Critical Assertions:** 4 steps rendered | Each has title and description | Icons present
- **Status:** tested
- **Test Files:** Unit: `src/components/landing/__tests__/HowItWorks.test.tsx` | E2E: `e2e/features.spec.ts`

### F-003: Comparison Table
- **Route:** `/` (bottom section)
- **Description:** Feature comparison table: LaunchReady vs Lighthouse vs Semrush. 10 feature rows plus price row.
- **Components:** Comparison
- **Critical Assertions:** 3 column headers | 10 feature rows | Price row | Check/X icons
- **Status:** tested
- **Test Files:** Unit: `src/components/landing/__tests__/Comparison.test.tsx` | E2E: `e2e/features.spec.ts`

### F-004: Pricing Page
- **Route:** `/pricing`
- **Description:** Three pricing tiers (Free $0, Starter $19/mo, Pro $39/mo) with feature lists and CTAs. FAQ section with FAQPage JSON-LD. Paid plan buttons disabled (Coming Soon).
- **Components:** Pricing (page.tsx), Faq
- **Database Tables:** None
- **Critical Assertions:** 3 plan cards | Correct prices | Feature lists | FAQ section | JSON-LD FAQPage | Paid buttons disabled
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/plans.test.ts` | E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

---

## Audit Engine

### F-005: Audit Form — URL Validation & Submission
- **Route:** `/` (AuditForm component)
- **Description:** URL input with validation. Auto-prepends https:// if missing. Validates URL format. Checks monthly audit limit for free users before calling edge function. Shows loading spinner during audit.
- **Components:** AuditForm
- **Edge Functions:** `run-audit`
- **Database Tables:** `audits` (for limit check)
- **Critical Assertions:** Empty URL rejected | Invalid URL shows error | https:// auto-prepended | Free plan limit enforced | Loading state shown during audit
- **Status:** tested
- **Test Files:** Unit: `src/components/audit/__tests__/AuditForm.test.tsx` | E2E: `e2e/features.spec.ts`

### F-006: Audit Results Display
- **Route:** `/` (after audit completes)
- **Description:** Displays audit score ring, pass/fail/warn counts, checks grouped by 7 categories (meta, social, indexability, structure, performance, accessibility, security). Free tier shows top N issues, hides fix code. Upgrade banners for free users.
- **Components:** AuditResults, CheckItem, ScoreRing
- **Critical Assertions:** Score ring displays | Category grouping correct | Free tier hides fix code | Upgrade banner shown for free | Pass/fail/warn counts accurate
- **Status:** tested
- **Test Files:** Unit: `src/components/audit/__tests__/AuditResults.test.tsx` | Unit: `src/components/audit/__tests__/CheckItem.test.tsx` | Unit: `src/components/ui/__tests__/ScoreRing.test.tsx`

### F-007: Check Item — Expandable Details with Fix Code
- **Route:** `/` (within AuditResults)
- **Description:** Each audit check is expandable. Shows status icon, name, description. Expanded view shows details, fix explanation, fix location, and copy-paste fix code. Locked (blurred) for free users with "Unlock Fix Code" CTA.
- **Components:** CheckItem, CopyButton
- **Critical Assertions:** Click toggles expansion | Status icon matches check status | Fix code shown for paid | Fix code locked for free | Copy button works
- **Status:** tested
- **Test Files:** Unit: `src/components/audit/__tests__/CheckItem.test.tsx` | Unit: `src/components/ui/__tests__/CopyButton.test.tsx`

### F-008: PDF Export
- **Route:** `/` (within AuditResults, pro plan only)
- **Description:** Generates PDF report using jsPDF. Includes score, URL, pass/fail/warn summary, all checks grouped by category with fix code. Dynamic import to avoid main bundle bloat.
- **Components:** PdfExportButton
- **Critical Assertions:** Button visible for pro plan | Click triggers PDF generation | Loading state during generation | Error state on failure
- **Status:** tested
- **Test Files:** Unit: `src/components/audit/__tests__/PdfExportButton.test.tsx`

---

## Authentication

### F-009: Auth Modal — Multi-Step Login/Signup
- **Route:** Any page (modal overlay)
- **Description:** Multi-step auth flow: signup (email -> OTP -> set password), login (email -> choose method -> password or OTP). Forgot password flow. Focus trap, Escape to close, click-outside to close.
- **Components:** AuthModal, OtpInputRow, Overlay, BackButton
- **Edge Functions:** None (uses Supabase Auth)
- **Database Tables:** `auth.users`
- **Critical Assertions:** Modal opens/closes | Step navigation works | Email validation | OTP input with auto-focus | Password validation (min 8 chars) | Error messages displayed | Focus trapped in modal
- **Status:** tested
- **Test Files:** Unit: `src/components/auth/__tests__/AuthModal.test.tsx` | E2E: `e2e/features.spec.ts`

### F-010: Password Reset Page
- **Route:** `/reset-password`
- **Description:** Standalone page for resetting password after receiving email link. Listens for PASSWORD_RECOVERY auth event. Validates password match and minimum length. Shows success state after update.
- **Components:** ResetPassword (page.tsx)
- **Database Tables:** `auth.users`
- **Critical Assertions:** Form visible after PASSWORD_RECOVERY event | Password mismatch error | Min 8 chars error | Success state after update
- **Status:** tested
- **Test Files:** Unit: `src/app/reset-password/__tests__/page.test.tsx` | E2E: `e2e/smoke.spec.ts`

---

## Dashboard

### F-011: Dashboard — Audit History
- **Route:** `/dashboard`
- **Description:** Shows user's past audits with score ring, URL, timestamp, pages crawled. Login prompt for unauthenticated users. Fetches from `audits` table. Filters out monitoring audits. Link to new audit.
- **Components:** Dashboard (page.tsx), AuditCard, ScoreRing, AuthModal
- **Database Tables:** `audits`
- **Critical Assertions:** Login prompt when not authenticated | Audit list when authenticated | Score ring per audit | Empty state when no audits | New Audit link
- **Status:** tested
- **Test Files:** Unit: `src/app/dashboard/__tests__/page.test.tsx` | E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-012: Monitored Sites (Pro Plan)
- **Route:** `/dashboard` (MonitoredSites section)
- **Description:** Pro users can add up to 5 sites for weekly automated re-audits. Shows score, trend (up/down/neutral), last checked date. Manual re-audit button. Add/remove sites. Upgrade banner for non-pro users.
- **Components:** MonitoredSites, ScoreRing
- **Edge Functions:** `run-audit`, `run-monitoring`
- **Database Tables:** `monitored_sites`, `audits`
- **Critical Assertions:** Add site form validates URL | Duplicate check | Site limit enforced | Score trend displayed | Manual re-audit triggers | Remove site works | Upgrade banner for non-pro
- **Status:** tested
- **Test Files:** Unit: `src/components/monitoring/__tests__/MonitoredSites.test.tsx` | E2E: `e2e/features.spec.ts`

---

## UI Components

### F-013: Score Ring
- **Route:** Multiple (landing, dashboard, monitoring)
- **Description:** SVG circular score indicator with color-coded ring (green >= 90, yellow >= 70, orange >= 50, red < 50). Configurable size. Accessible with role="img" and aria-label.
- **Components:** ScoreRing
- **Critical Assertions:** Renders score number | Ring color matches score range | Size prop works | Accessible label present
- **Status:** tested
- **Test Files:** Unit: `src/components/ui/__tests__/ScoreRing.test.tsx`

### F-014: Copy Button
- **Route:** Within CheckItem (audit results)
- **Description:** Copies text to clipboard. Three states: idle, copied (green), error (red). Auto-resets after 2 seconds. Uses navigator.clipboard API.
- **Components:** CopyButton
- **Critical Assertions:** Click copies text | Shows "Copied!" state | Shows "Failed" on error | Resets to idle | Accessible labels
- **Status:** tested
- **Test Files:** Unit: `src/components/ui/__tests__/CopyButton.test.tsx`

### F-015: Header & Navigation
- **Route:** All pages (layout)
- **Description:** Sticky header with logo, desktop nav (How it works, Pricing, auth/dashboard links), mobile hamburger menu. Auth-aware: shows login/signup when logged out, My Audits/Sign out when logged in.
- **Components:** Header, AuthModal
- **Critical Assertions:** Logo links to home | Desktop nav visible on wide screens | Mobile hamburger toggles menu | Auth state reflected | Escape closes mobile menu
- **Status:** tested
- **Test Files:** Unit: `src/components/layout/__tests__/Header.test.tsx` | E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-016: Password Gate
- **Route:** All pages (layout wrapper)
- **Description:** Pre-launch access control. SHA-256 hashed password check. Persists unlock in sessionStorage. Screenshot mode bypass via NEXT_PUBLIC_SCREENSHOT_MODE env var.
- **Components:** PasswordGate
- **Critical Assertions:** Gate shown on first visit | Wrong password shows error | Correct password unlocks | SessionStorage persists unlock | Screenshot mode bypasses gate
- **Status:** tested
- **Test Files:** Unit: `src/components/shared/__tests__/PasswordGate.test.tsx` | E2E: `e2e/smoke.spec.ts`

---

## Layout & SEO

### F-017: Root Layout with Metadata
- **Route:** All pages
- **Description:** HTML structure with Inter font, dark theme, metadata (title, OG, Twitter), favicon, noscript fallback, skip-to-content link, footer with legal links.
- **Components:** RootLayout, Header, PasswordGate
- **Critical Assertions:** HTML lang="en" | Theme color set | Skip-to-content link | Footer legal links | Noscript message
- **Status:** tested
- **Test Files:** E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-018: Error Boundary
- **Route:** Any (error.tsx)
- **Description:** Client-side error boundary page with "Try again" button and "Back to home" link.
- **Components:** Error (error.tsx)
- **Critical Assertions:** Error message displayed | Reset button present | Home link present
- **Status:** tested
- **Test Files:** Unit: `src/app/__tests__/error.test.tsx`

### F-019: 404 Not Found
- **Route:** Any invalid route
- **Description:** Custom 404 page with "Back to LaunchReady" link.
- **Components:** NotFound (not-found.tsx)
- **Critical Assertions:** 404 text displayed | Home link present
- **Status:** tested
- **Test Files:** Unit: `src/app/__tests__/not-found.test.tsx`

---

## Legal Pages

### F-020: Impressum
- **Route:** `/impressum`
- **Description:** Company details: Predivo GmbH, address, UID, commercial register, contact, disclaimer, copyright, links policy.
- **Components:** Impressum (page.tsx)
- **Critical Assertions:** Company name visible | Address shown | UID displayed | Back link present
- **Status:** tested
- **Test Files:** E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-021: Privacy Policy
- **Route:** `/privacy`
- **Description:** Full privacy policy: responsible party, data collected, purpose, hosting, third parties, cookies, GDPR/DSG rights, deletion, changes, contact.
- **Components:** Privacy (page.tsx)
- **Critical Assertions:** Title visible | 11 sections | Contact email present | Back link
- **Status:** tested
- **Test Files:** E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

### F-022: Terms of Service
- **Route:** `/terms`
- **Description:** Full ToS: service provider, description, accounts, acceptable use, IP, liability, cancellation, privacy, changes, severability, governing law, contact.
- **Components:** Terms (page.tsx)
- **Critical Assertions:** Title visible | 12 sections | Swiss law mentioned | Back link
- **Status:** tested
- **Test Files:** E2E: `e2e/smoke.spec.ts` | E2E: `e2e/features.spec.ts`

---

## Utility Library

### F-023: Score Color Utilities
- **Route:** N/A (library)
- **Description:** `scoreColor()`, `scoreRingColor()`, `scoreRgb()` — map numeric scores to Tailwind color classes and RGB tuples for UI rendering and PDF export.
- **Components:** N/A (utils.ts)
- **Critical Assertions:** Green for >= 90 | Yellow for >= 70 | Orange for >= 50 | Red for < 50
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/utils.test.ts`

### F-024: Category Label Utility
- **Route:** N/A (library)
- **Description:** `categoryLabel()` — maps category slugs (meta, social, indexability, etc.) to human-readable labels for display.
- **Components:** N/A (utils.ts)
- **Critical Assertions:** All 7 categories map correctly | Unknown category returns slug as-is
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/utils.test.ts`

### F-025: Count By Status Utility
- **Route:** N/A (library)
- **Description:** `countByStatus()` — counts checks by pass/fail/warn status for summary display.
- **Components:** N/A (utils.ts)
- **Critical Assertions:** Counts pass, fail, warn correctly | Ignores skip status | Empty array returns zeros
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/utils.test.ts`

### F-026: Fetch With Timeout Utility
- **Route:** N/A (library)
- **Description:** `fetchWithTimeout()` — wraps fetch with AbortController for timeout. Default 60s. Used for edge function calls.
- **Components:** N/A (utils.ts)
- **Critical Assertions:** Returns response on success | Aborts on timeout | Clears timeout on completion
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/utils.test.ts`

### F-027: Build Auth Headers Utility
- **Route:** N/A (library)
- **Description:** `buildAuthHeaders()` — builds request headers with Content-Type and optional Bearer token from current Supabase session.
- **Components:** N/A (utils.ts)
- **Critical Assertions:** Always includes Content-Type | Includes Bearer token when session exists | No Authorization header when no session
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/utils.test.ts`

---

## Plan System

### F-028: Plan Definitions & Limits
- **Route:** N/A (library)
- **Description:** Three plan tiers with limits: Free (1 audit/mo, 5 issues, no fix code, no PDF, no monitoring), Starter (unlimited, all issues, fix code), Pro (everything + PDF + monitoring 5 sites). `PLANS` array for pricing page display.
- **Components:** N/A (plans.ts)
- **Critical Assertions:** 3 plan IDs | Free limits correct | Starter limits correct | Pro limits correct | PLANS array has 3 items | Highlighted plan is Starter
- **Status:** tested
- **Test Files:** Unit: `src/lib/__tests__/plans.test.ts`

---

## Auth Hook

### F-029: useAuth Hook
- **Route:** N/A (hook)
- **Description:** React hook providing user, plan, loading, signOut. Listens for auth state changes. Fetches plan from user_plans table. Screenshot mode provides mock user with pro plan.
- **Components:** N/A (useAuth.ts)
- **Database Tables:** `user_plans`
- **Critical Assertions:** Returns null user when not authenticated | Returns plan 'free' by default | signOut function callable | Loading state true initially
- **Status:** tested
- **Test Files:** Unit: `src/hooks/__tests__/useAuth.test.ts`

---

## Edge Functions

### F-030: run-audit Edge Function
- **Route:** N/A (Supabase Edge Function)
- **Description:** Server-side audit engine. Fetches URL, parses HTML with Cheerio. Runs 11 check categories (meta tags, OG, Twitter, headings, images, sitemap, robots.txt, JSON-LD, security headers, HTTPS, viewport). AI fix generation via Anthropic API for paid users. CORS, SSRF protection, IP rate limiting, audit limit enforcement. Saves results to DB for authenticated users.
- **Components:** N/A (edge function)
- **Database Tables:** `audits`, `user_plans`
- **Critical Assertions:** URL required | Invalid URL rejected | Private URLs blocked (SSRF) | Rate limiting enforced | Free plan strips fix code | Results saved for auth users
- **Status:** implemented
- **Test Files:** E2E: `e2e/features.spec.ts`

### F-031: run-monitoring Edge Function
- **Route:** N/A (Supabase Edge Function, called by pg_cron)
- **Description:** Weekly cron job that re-audits all active monitored sites for pro users. Verifies user plan, calls run-audit for each site, updates scores and timestamps.
- **Components:** N/A (edge function)
- **Database Tables:** `monitored_sites`, `audits`, `user_plans`
- **Critical Assertions:** Only pro users processed | Scores updated | Previous score preserved | Audit saved with monitoring flag
- **Status:** implemented
- **Test Files:** E2E: `e2e/features.spec.ts`

---

## Database

### F-032: Database Schema
- **Route:** N/A
- **Description:** Tables: `audits` (user_id, url, overall_score, checks, pages_crawled, is_monitoring, monitored_site_id), `user_plans` (user_id, plan), `monitored_sites` (user_id, url, active, last_score, prev_score, last_checked_at). RLS policies. Auto-create user plan trigger. Performance indexes.
- **Database Tables:** `audits`, `user_plans`, `monitored_sites`
- **Critical Assertions:** RLS enabled on all tables | User can only read own data | Plan auto-created on signup
- **Status:** implemented
- **Test Files:** E2E: `e2e/features.spec.ts`

---

<!-- Coverage Summary: 32 features | 27 tested | 5 backend-only (implemented) -->
