'use client'

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

// Public site key (safe to embed — Cloudflare Turnstile site keys are meant to be public).
//
// UNLIKE ReplyFlow's TurnstileWidget, this does NOT hardcode a key: the fleet holds no Cloudflare
// API token for LaunchReady yet, so no widget has been minted for this product. Read it from env
// instead. When it is absent, render() below returns null and onToken is never called — captchaToken
// stays undefined on every auth call site, which keeps this whole change a no-op until whoever flips
// the server-side captcha switch also sets NEXT_PUBLIC_TURNSTILE_SITE_KEY. Never hardcode one here.
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
