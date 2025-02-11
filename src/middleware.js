import { NextResponse } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/admin/login'];

const adminRoutes = ['/admin'];

const protectedRoutes = [
  '/challenges',
  '/team',
  '/profile',
  '/settings',
  '/leaderboard',
];

const matchesRoute = (path, patterns) => {
  return patterns.some((pattern) => {
    if (pattern === path) return true;

    if (pattern.endsWith('*')) {
      const basePattern = pattern.slice(0, -1);
      return path.startsWith(basePattern);
    }

    return path.startsWith(`${pattern}/`);
  });
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth-token')?.value;
  const adminToken = request.cookies.get('admin-secret')?.value;

  const isAdminRoute = matchesRoute(pathname, adminRoutes);
  const isAdminLoginRoute = pathname === '/admin/login';

  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);

  const isPublicRoute = matchesRoute(pathname, publicRoutes);

  if (isAdminRoute) {
    if (isAdminLoginRoute) {
      if (adminToken === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!adminToken || adminToken !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (isPublicRoute && authToken && pathname !== '/') {
    return NextResponse.redirect(new URL('/challenges', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next/data).*)',
  ],
};
