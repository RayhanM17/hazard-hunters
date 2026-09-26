import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME  = 'hh_user_id'
const PUBLIC_PATHS = ['/login', '/api/login', '/api/health']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const userId = request.cookies.get(COOKIE_NAME)?.value
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
