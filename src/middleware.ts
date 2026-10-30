import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

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
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const hasAppAuth = request.cookies.has('trce_auth_user_v1');
  const hasSupabaseAuth =
    request.cookies.has('sb-pimnkcefqfxnqxgtqevq-auth-token') ||
    request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  // If already authenticated and visiting login or signup -> redirect directly into dashboard
  if (isAuthPage && (hasAppAuth || hasSupabaseAuth)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Fast path: If authenticated via TRCE app cookie, allow protected routes immediately
  if (isProtected && hasAppAuth) {
    return NextResponse.next();
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
