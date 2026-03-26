'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Zap, LogOut, History, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileNavRef = useRef<HTMLElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!mobileOpen || !mobileNavRef.current) return
    const first = mobileNavRef.current.querySelector<HTMLElement>('a, button')
    first?.focus()

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen])

  function openAuth(mode: 'login' | 'signup') {
    setAuthMode(mode)
    setShowAuth(true)
    setMobileOpen(false)
  }

  return (
    <>
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            LaunchReady
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-3">
            <Link href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors py-2">How it works</Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors py-2">Pricing</Link>

            {loading ? null : user ? (
              <>
                <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  <History className="w-4 h-4" />My Audits
                </Link>
                <button onClick={() => signOut()} aria-label="Sign out" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="text-sm text-zinc-400 hover:text-white transition-colors">Log in</button>
                <button onClick={() => openAuth('signup')} className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">Sign up</button>
              </>
            )}

            {user && (
              <Link href="/#audit" className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">New Audit</Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav ref={mobileNavRef} aria-label="Mobile navigation" className="sm:hidden border-t border-zinc-800 px-4 py-4 space-y-3 bg-zinc-950">
            <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors py-1">How it works</Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors py-1">Pricing</Link>

            {loading ? null : user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors">My Audits</Link>
                <button onClick={async () => { await signOut(); setMobileOpen(false) }} className="block text-sm text-zinc-400 hover:text-white transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="block text-sm text-zinc-400 hover:text-white transition-colors">Log in</button>
                <button onClick={() => openAuth('signup')} className="block text-sm text-zinc-400 hover:text-white transition-colors">Sign up</button>
              </>
            )}

            <Link href="/#audit" onClick={() => setMobileOpen(false)} className="block text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-center">Free Audit</Link>
          </nav>
        )}
      </header>

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </>
  )
}
