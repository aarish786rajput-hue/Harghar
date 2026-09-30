import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Proxy to protect specific routes — replaces deprecated middleware.ts
export function proxy(request: NextRequest) {
  // Check for auth cookie set by Firebase login flow
  const authToken =
    request.cookies.get('user-session')?.value ||
    request.cookies.get('firebase-auth-token')?.value

  const pathname = request.nextUrl.pathname

  // Protect /admin routes — must be logged in (isAdmin checked inside layout)
  if (pathname.startsWith('/admin')) {
    if (!authToken) {
      const url = new URL('/', request.url)
      url.searchParams.set('loginRequired', 'true')
      return NextResponse.redirect(url)
    }
  }

  // Protect user-specific pages — must be logged in
  if (
    pathname.startsWith('/my-bookings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/partner/dashboard')
  ) {
    if (!authToken) {
      const url = new URL('/', request.url)
      url.searchParams.set('loginRequired', 'true')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
