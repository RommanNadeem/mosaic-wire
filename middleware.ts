import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware runs on the edge runtime
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Add any middleware logic here if needed (e.g., authentication, redirects, etc.)
  return NextResponse.next()
}

