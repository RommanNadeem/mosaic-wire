import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getProjectRef(url: string | undefined | null) {
  if (!url) return null
  try {
    const u = new URL(url)
    // https://<ref>.supabase.co
    return u.hostname.split('.')[0] || null
  } catch {
    return null
  }
}

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null

  const client = createServerClient()

  if (!client) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'Supabase is not configured on the server.',
        serverSupabaseUrlPresent: !!process.env.SUPABASE_URL,
        publicSupabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      { status: 500 }
    )
  }

  // Minimal sanity check query to verify which DB we are reading from.
  const { data, error } = await client
    .from('topic_snapshots')
    .select('topic_id, updated_at, trending_score, detailed_summary')
    .order('trending_score', { ascending: false })
    .limit(1)

  return NextResponse.json({
    ok: !error,
    projectRef: getProjectRef(supabaseUrl),
    supabaseHost: supabaseUrl ? new URL(supabaseUrl).host : null,
    sampleTopTopic: data?.[0] || null,
    error: error ? { message: error.message, code: (error as any).code } : null,
    now: new Date().toISOString(),
  })
}


