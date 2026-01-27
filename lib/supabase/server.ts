import { createClient } from '@supabase/supabase-js'

// For server-side, use environment variables (never hardcode secrets)
// Prefer non-prefixed vars for server-only secrets, fallback to NEXT_PUBLIC_ vars
// NOTE: Service role keys should NEVER be used in client-accessible code
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client for server-side usage (RSC)
// This creates a new client instance for each request
// Uses anon key only - service role keys should never be in this codebase
export function createServerClient() {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null
  }

  // Next.js App Router can cache `fetch` calls. Supabase-js uses `fetch` under the hood,
  // so we override it to ensure all Supabase reads are "no-store" (always fresh).
  const fetchNoStore: typeof fetch = (input, init) => {
    const nextInit = (init || {}) as any
    return fetch(input as any, {
      ...nextInit,
      cache: 'no-store',
    })
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: fetchNoStore },
  })
}

