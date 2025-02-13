import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the existing response
  const response = NextResponse.next()

  // Add the required security headers
  response.headers.set(
    'Permissions-Policy',
    'clipboard-write=*, clipboard-read=*'
  )

  return response
}

// Specify which paths this middleware will run on
export const config = {
  matcher: '/:path*',
} 