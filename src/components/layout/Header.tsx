'use client'

import { useState } from 'react'
import { Zap, User, LogOut, History } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from '@/components/auth/AuthModal'

export function Header() {
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  function openAuth(mode: 'login' | 'signup') {
    setAuthMode(mode)
    setShowAuth(true)
  }

  return (
    <>
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Zap className="w-5 h-5 text-blue-500" />
            LaunchReady
          </a>
          <nav className="flex items-center gap-3">
            <a href="/#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How it works</a>
            <a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>

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

            {!user && (
              <a href="/#audit" className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">Free Audit</a>
            )}
          </nav>
        </div>
      </header>

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </>
  )
}
