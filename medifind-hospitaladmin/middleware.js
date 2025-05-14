import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't need authentication
  const isPublicPath = path.startsWith('/auth/') || path === '/auth';
  
  // Get auth token from cookies or headers
  const token = request.cookies.get('authToken')?.value || '';
  
  // Redirect logic
  if (!isPublicPath && !token) {
    // If trying to access a protected route without a token, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  if (isPublicPath && token) {
    // If trying to access auth pages with a token, redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/settings/:path*',
    '/reports/:path*',
    '/patients/:path*',
    '/appointments/:path*',
    '/doctors/:path*',
    '/inventory/:path*',
    '/services/:path*',
    '/auth/:path*',
  ],
};
