import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — browser client (uses anon key, respects RLS)
let _browser: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_browser) {
    _browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browser
}

// Proxy object that lazily initializes on first property access
// This avoids calling createClient() at module evaluation time during build
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Server client (uses service_role key, bypasses RLS — for API routes only)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
