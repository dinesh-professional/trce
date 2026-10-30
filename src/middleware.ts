import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Lightweight edge route protection - avoids blocking roundtrip network calls in middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    '/dashboard',
    '/machines',
    '/incidents',
    '/inventory',
    '/suppliers',
    '/activity',
    '/settings',
    '/scenario',
  ];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if session token cookie exists
  const hasAuthCookie =
    request.cookies.has('sb-pimnkcefqfxnqxgtqevq-auth-token') ||
    request.cookies.has('trce_auth_user_v1') ||
    request.cookies.getAll().some((c) => c.name.includes('auth') || c.name.includes('token') || c.name.includes('supabase'));

  // If attempting to access protected route with no session evidence, redirect fast
  if (isProtected && !hasAuthCookie) {
    // Only redirect if absolutely no auth cookie is present
    return updateSession(request);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (*.svg, *.png, *.jpg, *.ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

