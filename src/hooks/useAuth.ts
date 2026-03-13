'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { PlanId } from '@/lib/plans'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [plan, setPlan] = useState<PlanId>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    if (!user) {
      setPlan('free')
      return
    }
    supabase
      .from('user_plans')
      .select('plan')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error: planErr }) => {
        if (planErr) console.error('Failed to fetch plan:', planErr.message)
        const p = data?.plan
        setPlan(p === 'starter' || p === 'pro' ? p : 'free')
      })
  }, [user])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, plan, loading, signIn, signUp, signOut }
}
