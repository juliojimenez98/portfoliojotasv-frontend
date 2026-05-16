import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware: Protect /admin and /app/* routes.
 *
 * - Unauthenticated users → redirect to /login
 * - Users without access to a specific app → redirect to /unauthorized
 * - /admin requires isAdmin flag
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes — skip protection
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicons')
  ) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!session?.user) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes → require isAdmin
  if (pathname.startsWith('/admin')) {
    if (!session.user.isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // App routes → check allowedApps
  if (pathname.startsWith('/app/')) {
    // Extract app name from path: /app/gastos/... → "gastos"
    const segments = pathname.split('/');
    const appName = segments[2]; // ["", "app", "gastos", ...]

    if (appName && !session.user.isAdmin && !session.user.allowedApps?.includes(appName)) {
      return NextResponse.redirect(new URL('/unauthorized', req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, svgs, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
