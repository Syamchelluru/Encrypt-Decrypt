import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/profile'
]

const adminRoutes = [
  '/dashboard/admin'
]

const authRoutes = [
  '/login',
  '/signup'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get current user
  const user = await getCurrentUser(request)
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const redirectUrl = new URL('/dashboard/user', request.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Check admin access
  if (isAdminRoute && (!user || user.role !== 'admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    } else {
      // User is authenticated but not admin
      const redirectUrl = new URL('/dashboard/user', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Add user info to headers for API routes
  if (user && pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

