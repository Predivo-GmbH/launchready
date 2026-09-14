#!/usr/bin/env node
/**
 * signin-captcha.prod.test.mjs — production/staging regression guard for the sign-in
 * bot-protection fix on LaunchReady.
 *
 * THE VULNERABILITY, measured live 2026-09-14 against production (hcfeoescybfngjsphekq):
 * a tokenless POST to /auth/v1/recover got HTTP 200, and a tokenless POST to /auth/v1/otp reached
 * GoTrue's user-lookup logic (422 otp_disabled) rather than being refused for captcha. security_
 * captcha_enabled reads false. AuthModal.tsx called signInWithOtp / signInWithPassword /
 * resetPasswordForEmail with no challenge token, so anyone on the internet who knows a LaunchReady
 * customer's email address could make LaunchReady email them a password-reset link or a login code,
 * unlimited — from the Postmark sending reputation the whole fleet shares.
 *
 * THE FIX has two halves that must land in this order:
 *   1. CLIENT: thread a Cloudflare Turnstile captchaToken through every captcha-protected auth
 *      endpoint in src/components/auth/AuthModal.tsx (signInWithOtp x3 call sites — signup, login,
 *      resend — signInWithPassword, resetPasswordForEmail), and render TurnstileWidget
 *      (src/components/auth/TurnstileWidget.tsx) on every step that can trigger one. The widget
 *      reads NEXT_PUBLIC_TURNSTILE_SITE_KEY and renders NOTHING (token stays undefined) while that
 *      env var is unset, so it is a true no-op anywhere the key is absent — local dev and the e2e
 *      run included. The key now EXISTS: Cloudflare widget "LaunchReady sign-in (2026-09-14)",
 *      site key 0x4AAAAAAEz4tx6MPfxDoesw, Managed mode, hostnames launchready.predivo.ch and
 *      staging.launchready.predivo.ch. Both deploy workflows pass it into `next build` AND assert
 *      afterwards that it is actually inlined in ./out/ — because NEXT_PUBLIC_* is a build-time
 *      substitution, an unset var ships a bundle with no widget, which no runtime monitor can see
 *      and which becomes a total lockout the instant half 2 is switched on.
 *   2. SERVER: enable CAPTCHA (Turnstile provider + secret) in the project's Auth settings. This is
 *      the switch that actually closes the hole. PROJECT-WIDE once flipped — every protected
 *      endpoint on that project then demands a token.
 *
 * WHY THIS TEST EXISTS AND NOT JUST THE DEPLOY: a green client deploy is NOT the fix — the
 * Auth-settings switch is. Only an unauthenticated probe against the LIVE GoTrue can tell whether a
 * tokenless OTP request is actually refused. This guard is that probe. It is RED for production
 * today, and that is correct: it goes green the moment, and only the moment, the hole is truly
 * closed. Enabling/disabling the switch is NOT done by this file or anything it calls — that is a
 * separate, human-gated production change.
 *
 * CREDENTIAL-FREE by design: the anon/publishable key it needs is PUBLIC — it ships in every
 * visitor's browser. For production it is fetched from the live bundle at runtime (the site is
 * public); for staging (which sits behind HTTP Basic auth per deploy-staging.yml, so the bundle
 * cannot be fetched anonymously) it is read from STAGING_SUPABASE_ANON_KEY when present (CI has it,
 * same secret name keep-alive.yml already uses). A project whose key cannot be obtained is SKIPPED
 * LOUDLY — never a silent pass.
 *
 * The probe address uses the .local TLD (reserved, non-routable, RFC 2606-adjacent) and
 * create_user:false, so a still-open endpoint cannot actually mail a real person here. NEVER point
 * this at a real address.
 *
 * STAGING IS DELIBERATELY LEFT OPEN, AND THAT IS ASSERTED, NOT ASSUMED. The reason CHANGED on
 * 2026-09-14 and the old one is recorded here because it was wrong in an instructive way: this file
 * used to say no Turnstile site key had been minted for LaunchReady and none could be, since the
 * fleet held no Cloudflare API token. That was a statement about curl, not about the task — the
 * Cloudflare dashboard was reachable in a logged-in browser the whole time, and the key was minted
 * there. "A tool cannot reach it" is never "it cannot be done".
 *
 * The reason staging is still open is now narrower and purely about ORDER. Enabling captcha is
 * PROJECT-WIDE and there is exactly ONE captcha secret per Supabase project, so there is no test
 * key that could cover staging alone: the moment staging enforces, every tokenless sign-in on that
 * project fails. Production's client half is live and proven; staging's has not been proven the
 * same way. Turning staging on before that costs the fleet its manual QA flows and this repo's own
 * e2e/critical-path.spec.ts, which pings /auth/v1/ as a liveness check on every push to master
 * (test.yml). (Unlike ReplyFlow, LaunchReady's Playwright suite does not itself perform a
 * password-grant sign-in against staging — checked 2026-09-14, no auth.setup.ts and no spec posts to
 * /auth/v1/token or /auth/v1/otp — so that particular conflict does not apply here.)
 *
 * TO ENFORCE STAGING LATER, in order: confirm a staging deploy has shipped a bundle containing
 * 0x4AAAAAAEz4tx6MPfxDoesw (the deploy-staging workflow now asserts exactly this), solve the widget
 * once by hand on staging.launchready.predivo.ch, then flip `enforced` to true HERE and run
 * scripts/auth-captcha.mjs. That script currently REFUSES `enable --project staging` outright, so
 * this rationale has to be changed deliberately rather than bypassed at 2am.
 *
 * This guard therefore does not treat staging's open state as a failure — but it DOES fail if
 * staging starts ENFORCING captcha, because that means someone flipped the switch ahead of that
 * sequence and real sign-ins on staging are about to start breaking.
 *
 * Run: node supabase/functions/_shared/signin-captcha.prod.test.mjs
 * Exit 0 = every ENFORCED project refuses a tokenless OTP request, and no un-enforced project has
 *          started enforcing behind our back.
 * Exit 1 = an enforced project still accepts a tokenless OTP request (the hole is NOT closed), or
 *          an un-enforced project turned itself on, or nothing could be probed at all.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const PROJECTS = [
  {
    name: 'production',
    ref: 'hcfeoescybfngjsphekq',
    site: 'https://launchready.predivo.ch',
    anonEnv: 'SUPABASE_ANON_KEY',
    enforced: true,
  },
  {
    name: 'staging',
    ref: 'gjfcxynkirwerzxbkekh',
    // Behind HTTP Basic auth (deploy-staging.yml) — cannot be fetched anonymously, so this
    // relies on STAGING_SUPABASE_ANON_KEY (CI has it) rather than a bundle scan.
    site: null,
    anonEnv: 'STAGING_SUPABASE_ANON_KEY',
    enforced: false,
    whyNotEnforced:
      'enabling captcha is PROJECT-WIDE and there is exactly one captcha secret per Supabase project, ' +
      'so no test key can cover staging alone. The site key (0x4AAAAAAEz4tx6MPfxDoesw) does now cover ' +
      'staging.launchready.predivo.ch, but staging has not yet been shown to ship and solve the widget, ' +
      'and enforcing before that breaks staging QA and the /auth/v1/ liveness check in ' +
      'e2e/critical-path.spec.ts. Prove a staging deploy inlines the site key, solve the widget once on ' +
      'staging.launchready.predivo.ch, THEN flip this to enforced: true and run scripts/auth-captcha.mjs ' +
      '(which refuses --project staging until this rationale is changed on purpose).',
  },
]

const PROBE_EMAIL = 'signin-captcha-guard@launchready-test.local'

// Pull the public anon/publishable key out of a deployed frontend bundle — the same value every
// browser gets. Two formats: the newer `sb_publishable_...` key and the legacy anon JWT (role
// "anon"). We scan the HTML-referenced scripts and the entry's chunk graph.
function findKeyInSource(body) {
  const pub = body.match(/sb_publishable_[A-Za-z0-9_-]+/)
  if (pub) return pub[0]
  const jwts = body.match(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || []
  for (const jwt of jwts) {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'))
      if (payload.role === 'anon') return jwt
    } catch { /* not a JWT we can decode — keep looking */ }
  }
  return null
}

async function anonKeyFromSite(siteUrl) {
  const html = await (await fetch(siteUrl, { redirect: 'follow' })).text()
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => new URL(m[1], siteUrl).href)
  const seen = new Set(scripts)
  for (const js of scripts) {
    const body = await (await fetch(js)).text()
    const key = findKeyInSource(body)
    if (key) return key
    // The key may live in a lazily-imported chunk; queue chunk names referenced from this script.
    for (const name of new Set(body.match(/[A-Za-z0-9_]+-[A-Za-z0-9]+\.js/g) || [])) {
      const url = new URL(`assets/${name}`, siteUrl).href
      if (!seen.has(url)) { seen.add(url); scripts.push(url) }
    }
  }
  return null
}

/**
 * A Supabase management token, from CI's SUPABASE_ACCESS_TOKEN (the same env var
 * scripts/apply-migrations.mjs already uses for this repo) or from the gitignored credentials file
 * on a developer machine. The value is never printed, never put on a command line and never written
 * anywhere; a missing file is simply "no token", so this stays silent and harmless where no such
 * file exists.
 */
function managementToken() {
  const fromEnv = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  if (fromEnv) return fromEnv
  try {
    const text = readFileSync(new URL('../../../docs/Credentials.txt', import.meta.url), 'utf-8')
    return (text.match(/sbp_[A-Za-z0-9]{20,}/) || [])[0] || ''
  } catch {
    return ''
  }
}

/**
 * The same PUBLIC publishable key, from the project itself rather than from the website. Used only
 * when the bundle scan cannot be reached (or the project has no public site, like staging).
 * `reveal=true` is required or the value comes back masked, and only the row whose type is
 * `publishable` is taken — a project may also carry a legacy `anon` JWT that is disabled and 401s on
 * every request, which would turn a working guard into a confident "not a captcha refusal".
 */
async function anonKeyFromManagementApi(ref) {
  const token = managementToken()
  if (!token) return null
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Management API api-keys -> HTTP ${res.status}`)
  const rows = await res.json()
  const pub = (Array.isArray(rows) ? rows : []).find((r) => r.type === 'publishable')
  return pub?.api_key?.trim() || null
}

async function anonKeyFor(project) {
  const fromEnv = process.env[project.anonEnv]?.trim()
  if (fromEnv) return { key: fromEnv, source: `$${project.anonEnv}` }
  if (project.site) {
    try {
      const key = await anonKeyFromSite(project.site)
      if (key) return { key, source: project.site }
    } catch (err) {
      // The website being unreachable says nothing about GoTrue, which is what we are testing.
      console.error(`note - ${project.site} could not be read (${err.message}); trying the project itself.`)
    }
  }
  const key = await anonKeyFromManagementApi(project.ref)
  if (key) return { key, source: 'the Supabase Management API (publishable key)' }
  return null
}

// A tokenless /otp request looks like the exact abuse: an OTP send with no captcha proof. GoTrue
// carries the captcha token in gotrue_meta_security.captcha_token; we deliberately omit it.
async function tokenlessOtpRefused(project, anon) {
  const res = await fetch(`https://${project.ref}.supabase.co/auth/v1/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
    body: JSON.stringify({ email: PROBE_EMAIL, create_user: false }),
  })
  const text = await res.text()
  // Closed state: GoTrue rejects for a captcha reason (400 + captcha in the error).
  const looksLikeCaptchaRefusal = res.status === 400 && /captcha/i.test(text)
  return { ok: looksLikeCaptchaRefusal, status: res.status, body: text.slice(0, 300) }
}

let failures = 0
let covered = 0
let coveredEnforced = 0
for (const p of PROJECTS) {
  let found
  try {
    found = await anonKeyFor(p)
  } catch (err) {
    console.error(`SKIP - ${p.name} (${p.ref}): could not fetch anon key: ${err.message}`)
    continue
  }
  if (!found) {
    console.error(
      `SKIP - ${p.name} (${p.ref}): no anon key (set ${p.anonEnv}, or SUPABASE_ACCESS_TOKEN / docs/Credentials.txt to read the ` +
        'project\'s own publishable key). NOT counted as passing.'
    )
    continue
  }
  const { key: anon, source } = found
  covered++
  if (p.enforced) coveredEnforced++
  console.log(`     ${p.name}: probing with the public key from ${source}`)
  try {
    const r = await tokenlessOtpRefused(p, anon)
    assert.ok(
      r.status !== 401,
      `${p.name}: the key was REFUSED (401) — this run tested nothing about captcha. Check that ` +
        `${p.anonEnv} (or the project's Management API key) holds a live publishable/anon key. Body: ${r.body}`
    )
    if (p.enforced) {
      assert.ok(r.ok, `${p.name}: tokenless /otp must be refused for captcha (400/captcha); got ${r.status}: ${r.body}`)
      console.log(`ok - ${p.name} (${p.ref}): tokenless OTP request refused (captcha enforced)`)
    } else {
      // Not a pass for doing nothing: this asserts the OPPOSITE state, and says why it is the
      // right one today and exactly what has to happen before it changes.
      assert.ok(
        !r.ok,
        `${p.name}: captcha is now ENFORCED here, and it was deliberately left OFF — ${p.whyNotEnforced}`
      )
      console.log(`ok - ${p.name} (${p.ref}): still OFF on purpose (${r.status}), as recorded. ${p.whyNotEnforced}`)
    }
  } catch (err) {
    failures++
    console.error(`FAIL - ${p.name} (${p.ref}): ${err.message}`)
  }
}

if (covered === 0) {
  console.error('\nNo project could be probed (no anon key obtained). This guard proved nothing.')
  process.exit(1)
}
// COVERING ONLY THE PROJECT THAT IS SUPPOSED TO BE OPEN IS NOT COVERAGE. Without this, a run that
// reached staging and could not reach production would print a green line about the one project
// where nothing is being defended — the exact shape of a job that reports success for doing
// nothing. The hole this guard exists for is on the ENFORCED projects.
if (coveredEnforced === 0) {
  console.error('\nNo ENFORCED project could be probed. The only projects reached were ones deliberately left')
  console.error('open, so nothing was proved about the vulnerability this guard exists for.')
  process.exit(1)
}
if (failures > 0) {
  console.error(`\n${failures} project(s) are in the wrong captcha state — sign-in bot protection is NOT as recorded.`)
  process.exit(1)
}
console.log(
  `\nAll ${covered} covered project(s) are in the recorded state: ${coveredEnforced} enforcing captcha on ` +
    `tokenless OTP, ${covered - coveredEnforced} deliberately open. Sign-in bot protection is enforced where it must be.`
)
process.exit(0)
