'use client'

import { useState, type ReactNode } from 'react'

const GATE_PASSWORD_HASH = '3bd8037a8ed38a35825983767f94e6cf3b18c3deee1601daee71faec0d83565f'
const STORAGE_KEY = 'launchready-unlocked'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => {
      if (typeof window === 'undefined') return false
      return sessionStorage.getItem(STORAGE_KEY) === 'true'
    }
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const inputHash = await sha256(password)
    if (inputHash === GATE_PASSWORD_HASH) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '24rem', border: '1px solid #27272a', borderRadius: '0.5rem', padding: '2rem', backgroundColor: '#18181b' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fafafa' }}>LaunchReady</h1>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginTop: '0.5rem' }}>This app is in private beta.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="Enter access code"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            autoFocus
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #3f3f46', backgroundColor: '#09090b', color: '#fafafa', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
          />
          {error && <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>Incorrect access code.</p>}
          <button type="submit" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#2563eb', color: 'white', fontWeight: '500', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
