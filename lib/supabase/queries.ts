import { supabase, isSupabaseConfigured } from './client'
import { createServerClient } from './server'

/**
 * Fetch topics from topic_snapshots table (client-side)
 * Uses trending_score for ordering (precomputed snapshots)
 */
export async function getLatestTopics(limit: number | null = null) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    let query = supabase
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
    
    if (limit !== null && limit !== undefined) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getLatestTopics:', error)
    return []
  }
}

/**
 * Fetch topics from topic_snapshots table (server-side)
 * Uses trending_score for ordering (precomputed snapshots)
 */
export async function getLatestTopicsServer(limit: number | null = null) {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    let query = supabaseClient
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
    
    if (limit !== null && limit !== undefined) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Error fetching topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getLatestTopicsServer:', error)
    return []
  }
}

/**
 * Get a single topic by slug (extracts short ID from slug)
 * Used for server-side routing and meta tag generation
 */
export async function getTopicBySlug(slug: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !slug) {
    return null
  }

  try {
    // Extract short_id from slug (after double hyphen separator)
    // Slug format: "headline-text--b2ae-c2687c18c955"
    // Short ID: "b2ae-c2687c18c955" (17 chars, matches database _topic_short_id() format)
    const separatorIndex = slug.lastIndexOf('--')
    if (separatorIndex === -1) {
      return null
    }
    
    const shortId = slug.substring(separatorIndex + 2)
    
    // Validate short_id format: 17 chars (4 + hyphen + 12)
    if (!shortId || shortId.length !== 17 || !/^[a-f0-9]{4}-[a-f0-9]{12}$/i.test(shortId)) {
      return null
    }

    return await getTopicByShortIdServer(shortId)
  } catch (error) {
    console.error('Error in getTopicBySlug:', error)
    return null
  }
}

/**
 * Get a single topic by short_id (indexed column for fast lookup)
 * Used for server-side meta tag generation
 * Falls back to topics table if not found in topic_snapshots
 */
export async function getTopicByShortIdServer(shortId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !shortId) {
    return null
  }

  try {
    // Direct lookup using indexed short_id column in topic_snapshots
    const { data: snapshotTopic, error: snapshotError } = await supabaseClient
      .from('topic_snapshots')
      .select('*')
      .eq('short_id', shortId)
      .single()

    if (!snapshotError && snapshotTopic) {
      return snapshotTopic
    }

    // Fallback to topics table for archived topics (also uses indexed short_id)
    const { data: archivedTopic, error: archiveError } = await supabaseClient
      .from('topics')
      .select('*')
      .eq('short_id', shortId)
      .single()

    if (!archiveError && archivedTopic) {
      // Topics table has unified schema - minimal mapping needed
      return {
        ...archivedTopic,
        topic_id: archivedTopic.id || archivedTopic.topic_id,
      }
    }

    return null
  } catch (error) {
    console.error('Error in getTopicByShortIdServer:', error)
    return null
  }
}

/**
 * Fetch articles for a specific topic from article_snapshots table (server-side)
 */
export async function getArticlesForTopicServer(topicId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    const { data, error } = await supabaseClient
      .from('article_snapshots')
      .select('*')
      .contains('topic_ids', [topicId])
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles for topic:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArticlesForTopicServer:', error)
    return []
  }
}

/**
 * Fetch articles for a specific topic from article_snapshots table (client-side)
 */
export async function getArticlesForTopic(topicId: string) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('article_snapshots')
      .select('*')
      .contains('topic_ids', [topicId])
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles for topic:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArticlesForTopic:', error)
    return []
  }
}

/**
 * Fetch distinct tag values from topics (for archive tabs).
 * Returns sorted list of non-null tags from recent topics.
 */
export async function getArchiveCategoryTagsServer(): Promise<string[]> {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    const { data, error } = await supabaseClient
      .from('topics')
      .select('tag')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(500)

    if (error) {
      console.error('Error fetching archive category tags:', error)
      return []
    }

    const tags = [...new Set((data || []).map((r: { tag?: string | null }) => r.tag).filter(Boolean))] as string[]
    return tags.sort((a, b) => a.localeCompare(b))
  } catch (error) {
    console.error('Error in getArchiveCategoryTagsServer:', error)
    return []
  }
}

/**
 * Fetch archive topics from topics table (server-side).
 * Order: recent to older (updated_at descending).
 * Optional categoryTag filters by tag.
 */
export async function getArchiveTopicsServer(limit: number, offset: number = 0, categoryTag?: string | null) {
  const supabaseClient = createServerClient()
  if (!supabaseClient) {
    return []
  }

  try {
    const from = offset
    const to = offset + limit - 1
    let query = supabaseClient
      .from('topics')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })

    if (categoryTag && categoryTag !== 'All') {
      query = query.eq('tag', categoryTag)
    }
    const { data, error } = await query.range(from, to)

    if (error) {
      console.error('Error fetching archive topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArchiveTopicsServer:', error)
    return []
  }
}

/**
 * Fetch archive topics from topics table (client-side, for load-more).
 * Optional categoryTag filters by tag.
 */
export async function getArchiveTopics(limit: number, offset: number = 0, categoryTag?: string | null) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const from = offset
    const to = offset + limit - 1
    let query = supabase
      .from('topics')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })

    if (categoryTag && categoryTag !== 'All') {
      query = query.eq('tag', categoryTag)
    }
    const { data, error } = await query.range(from, to)

    if (error) {
      console.error('Error fetching archive topics:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getArchiveTopics:', error)
    return []
  }
}

/**
 * Get topics by category/tag
 */
export async function getTopicsByCategory(category: string) {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('topic_snapshots')
      .select('*')
      .eq('tag', category)
      .order('trending_score', { ascending: false })

    if (error) {
      console.error('Error fetching topics by category:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getTopicsByCategory:', error)
    return []
  }
}

