import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client only if configured (for client-side usage)
export const supabase = isSupabaseConfigured && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

