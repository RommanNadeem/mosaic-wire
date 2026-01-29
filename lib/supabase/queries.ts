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
    // Extract short ID from slug (last part after last hyphen)
    const parts = slug.split('-')
    const shortId = parts[parts.length - 1]
    
    if (!shortId || shortId.length > 6) {
      return null
    }

    return await getTopicByShortIdServer(shortId)
  } catch (error) {
    console.error('Error in getTopicBySlug:', error)
    return null
  }
}

/**
 * Get a single topic by short ID (last 6 characters of topic_id)
 * Used for server-side meta tag generation
 * Falls back to topics table if not found in topic_snapshots
 */
export async function getTopicByShortIdServer(shortId: string) {
  const supabaseClient = createServerClient()
  if (!supabaseClient || !shortId) {
    return null
  }

  try {
    // First, try to find in topic_snapshots (current/active topics)
    const { data: snapshotTopics, error: snapshotError } = await supabaseClient
      .from('topic_snapshots')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(200)

    if (!snapshotError && snapshotTopics && snapshotTopics.length > 0) {
      const topic = snapshotTopics.find(t => {
        const topicIdString = String(t.topic_id || t.id || '')
        const topicShortId = topicIdString.slice(-6)
        return topicShortId === shortId
      })

      if (topic) {
        return topic
      }
    }

    // If not found in snapshots, fallback to topics table (e.g. old/archived topics).
    // topics table schema uses: id, display_label, category_tag, first_seen_at, last_updated_at.
    const PAGE_SIZE = 500
    const MAX_PAGES = 40 // safety cap: 500 * 40 = 20k rows scanned max

    let topicFromTable: any | null = null

    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data: topicsPage, error: topicsError } = await supabaseClient
        .from('topics')
        .select('*')
        .order('last_updated_at', { ascending: false, nullsFirst: false })
        .range(from, to)

      if (topicsError) {
        console.error('Error fetching topics from topics table:', topicsError)
        return null
      }

      if (!topicsPage || topicsPage.length === 0) {
        break
      }

      topicFromTable = topicsPage.find((t: any) => {
        const topicIdString = String(t.id || t.topic_id || '')
        const topicShortId = topicIdString.slice(-6)
        return topicShortId === shortId
      }) || null

      if (topicFromTable) {
        break
      }
    }

    if (topicFromTable) {
      // Map topics table schema to topic_snapshots-like shape for transformTopicToNewsItem
      return {
        ...topicFromTable,
        topic_id: topicFromTable.id || topicFromTable.topic_id,
        headline: topicFromTable.display_label || topicFromTable.headline || topicFromTable.topic_name || null,
        summary: topicFromTable.summary || topicFromTable.ai_summary || null,
        tag: topicFromTable.category_tag || topicFromTable.tag || topicFromTable.category || null,
        image_url: topicFromTable.image_url || topicFromTable.image || null,
        article_count: topicFromTable.article_count || topicFromTable.cluster_size || 0,
        source_count: topicFromTable.source_count || 0,
        recent_articles_count: topicFromTable.recent_articles_count || 0,
        updated_at: topicFromTable.last_updated_at || topicFromTable.updated_at || new Date().toISOString(),
        topic_created_at: topicFromTable.first_seen_at || topicFromTable.created_at || topicFromTable.topic_created_at || null,
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
 * Fetch distinct category_tag values from topics (for archive tabs).
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
      .select('category_tag')
      .order('last_updated_at', { ascending: false, nullsFirst: false })
      .limit(500)

    if (error) {
      console.error('Error fetching archive category tags:', error)
      return []
    }

    const tags = [...new Set((data || []).map((r: { category_tag?: string | null }) => r.category_tag).filter(Boolean))] as string[]
    return tags.sort((a, b) => a.localeCompare(b))
  } catch (error) {
    console.error('Error in getArchiveCategoryTagsServer:', error)
    return []
  }
}

/**
 * Fetch archive topics from topics table (server-side).
 * Order: recent to older (last_updated_at descending).
 * Optional categoryTag filters by category_tag.
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
      .order('last_updated_at', { ascending: false, nullsFirst: false })

    if (categoryTag && categoryTag !== 'All') {
      query = query.eq('category_tag', categoryTag)
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
 * Optional categoryTag filters by category_tag.
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
      .order('last_updated_at', { ascending: false, nullsFirst: false })

    if (categoryTag && categoryTag !== 'All') {
      query = query.eq('category_tag', categoryTag)
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

