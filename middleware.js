/**
 * Vercel Middleware to intercept crawler requests
 * This runs on every request and checks if it's from a social media crawler
 */

export default function middleware(request) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check if this is a social media crawler
  const crawlerPatterns = [
    'facebookexternalhit',
    'Twitterbot',
    'TelegramBot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'SkypeUriPreview',
    'Discordbot'
  ]
  
  const isCrawler = crawlerPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  )
  
  // If it's a crawler requesting root path, rewrite to Edge Function
  if (isCrawler && url.pathname === '/') {
    // Extract hash from referer or URL
    const referer = request.headers.get('referer') || ''
    let hash = url.hash
    
    // Try to get hash from referer
    if (!hash && referer) {
      try {
        const refererUrl = new URL(referer)
        hash = refererUrl.hash
      } catch (e) {
        // Try to extract hash manually
        const hashMatch = referer.match(/#[^?&]+/)
        if (hashMatch) {
          hash = hashMatch[0]
        }
      }
    }
    
    // Rewrite to Edge Function with hash as query param
    const newUrl = new URL('/api/meta', request.url)
    if (hash) {
      newUrl.searchParams.set('hash', hash)
    }
    newUrl.searchParams.set('originalUrl', request.url)
    
    return Response.rewrite(newUrl)
  }
  
  // For non-crawlers, continue normally (return null to pass through)
  return new Response(null, {
    status: 200,
  })
}

export const config = {
  runtime: 'edge',
  matcher: '/',
}



