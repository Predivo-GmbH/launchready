'use client'

import { useState } from 'react'
import { Zap, LogOut, History, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [mobileOpen, setMobileOpen] = useState(false)

  function openAuth(mode: 'login' | 'signup') {
    setAuthMode(mode)
    setShowAuth(true)
    setMobileOpen(false)
  }

  return (
    <>
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            LaunchReady
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-3">
            <a href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors py-2">How it works</a>
            <a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors py-2">Pricing</a>

            {loading ? null : user ? (
              <>
                <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  <History className="w-4 h-4" />My Audits
                </a>
                <button onClick={signOut} className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
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
              <a href="/#audit" className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">New Audit</a>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
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
          <nav className="sm:hidden border-t border-zinc-800 px-4 py-4 space-y-3 bg-zinc-950">
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors py-1">How it works</a>
            <a href="/pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors py-1">Pricing</a>

            {loading ? null : user ? (
              <>
                <a href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm text-zinc-400 hover:text-white transition-colors">My Audits</a>
                <button onClick={() => { signOut(); setMobileOpen(false) }} className="block text-sm text-zinc-400 hover:text-white transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="block text-sm text-zinc-400 hover:text-white transition-colors">Log in</button>
                <button onClick={() => openAuth('signup')} className="block text-sm text-zinc-400 hover:text-white transition-colors">Sign up</button>
              </>
            )}

            <a href="/#audit" onClick={() => setMobileOpen(false)} className="block text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-center">Free Audit</a>
          </nav>
        )}
      </header>

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </>
  )
}
