// ═══════════════════════════════════════════════════════
// CORS middleware — allows punk.dewd.cool ↔ Vercel API
// calls to pass cookies through the Cloudflare proxy.
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://punk.dewd.cool',
  'https://www.punk.dewd.cool',
]

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

export function middleware(request) {
  const origin = request.headers.get('origin') || ''
  const isAllowed = ALLOWED_ORIGINS.includes(origin)
    || origin.endsWith('.vercel.app')   // preview deployments
    || !origin                          // same-origin (no Origin header)

  // Handle preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(isAllowed ? origin : ALLOWED_ORIGINS[0]),
    })
  }

  // For actual requests, add CORS headers to the response
  const response = NextResponse.next()
  const headers = corsHeaders(isAllowed ? origin : ALLOWED_ORIGINS[0])
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  return response
}

// Only run on API routes
export const config = {
  matcher: '/api/:path*',
}
