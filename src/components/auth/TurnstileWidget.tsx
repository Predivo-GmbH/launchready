'use client'

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

// Public site key (safe to embed — Cloudflare Turnstile site keys are meant to be public).
//
// THE KEY EXISTS NOW. The widget "LaunchReady sign-in (2026-09-14)" was minted in Cloudflare on
// 2026-09-14 — site key 0x4AAAAAAEz4tx6MPfxDoesw, Managed mode, hostnames launchready.predivo.ch
// and staging.launchready.predivo.ch. (An earlier version of this comment said no key had been
// minted because the fleet held no Cloudflare API token. That was a statement about curl, not about
// the task: the dashboard was reachable the whole time.)
//
// It is still read from the environment rather than hardcoded, so production and staging can ever
// diverge — but env is exactly where a public value goes quiet when it is missing. `next build`
// inlines NEXT_PUBLIC_* at BUILD time, so an unset var produces a bundle with no widget at all,
// which is invisible to every runtime monitor and becomes a TOTAL customer lockout the moment the
// server-side switch is flipped. Both deploy workflows therefore assert, after the build, that this
// exact key is present in ./out/ and fail the deploy if it is not.
//
// When it is absent the component renders null and onToken is never called, so captchaToken stays
// undefined on every auth call site — a true no-op, which is what makes this component safe in
// local dev and in the e2e run.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id?: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileHandle {
  reset: () => void
}

interface TurnstileWidgetProps {
  /** Called with a token on success, or null on load/expire/error. */
  onToken: (token: string | null) => void
}

/**
 * Cloudflare Turnstile widget (Managed mode — mostly invisible for legit users).
 * Produces a single-use token; call reset() after each use to get a fresh one.
 *
 * Renders nothing, and never calls onToken, when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset.
 */
const TurnstileWidget = forwardRef<TurnstileHandle, TurnstileWidgetProps>(({ onToken }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch {
          /* widget already gone — ignore */
        }
        onToken(null)
      }
    },
  }), [onToken])

  useEffect(() => {
    if (!SITE_KEY) return undefined

    let cancelled = false

    function renderWidget() {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(null),
        'expired-callback': () => onToken(null),
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderWidget)
    }

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [onToken])

  // No site key minted for LaunchReady yet — render nothing rather than a widget that can never
  // solve. overflow-x-auto (once a key exists): the Turnstile iframe is a fixed 300px; on narrow
  // phones it would otherwise push the page wider than the viewport.
  if (!SITE_KEY) return null

  return <div ref={containerRef} className="min-h-[65px] overflow-x-auto" />
})

TurnstileWidget.displayName = 'TurnstileWidget'
export default TurnstileWidget
