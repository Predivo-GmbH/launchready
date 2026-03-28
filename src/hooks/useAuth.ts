'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { PlanId } from '@/lib/plans'

const isScreenshotMode = process.env.NEXT_PUBLIC_SCREENSHOT_MODE === 'true'
const mockUser = isScreenshotMode ? { id: 'screenshot-mock', email: 'demo@launchready.test' } as User : null

export function useAuth() {
  const [user, setUser] = useState<User | null>(mockUser)
  const [plan, setPlan] = useState<PlanId>(isScreenshotMode ? 'pro' : 'free')
  const [loading, setLoading] = useState(!isScreenshotMode)

  useEffect(() => {
    if (isScreenshotMode) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user plan when user changes
  useEffect(() => {
    if (isScreenshotMode) return
    if (!user) {
      setPlan('free')
      return
    }
    supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const p = data?.plan
        setPlan(p === 'starter' || p === 'pro' ? p : 'free')
      })
  }, [user])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, plan, loading, signOut }
}
