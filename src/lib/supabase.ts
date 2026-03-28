import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — browser client (uses anon key, respects RLS)
let _browser: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_browser) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_URL')
    if (!key) throw new Error('Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY')
    _browser = createClient(url, key)
  }
  return _browser
}

// Proxy object that lazily initializes on first property access
// This avoids calling createClient() at module evaluation time during build
export const supabase: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  {
    get(_target, prop, receiver) {
      const client = getSupabase()
      const value = Reflect.get(client, prop, receiver)
      return typeof value === 'function' ? value.bind(client) : value
    },
  },
)