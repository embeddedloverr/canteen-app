import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Public routes that don't need authentication
    const publicRoutes = ['/', '/login', '/menu', '/cart', '/order', '/history'];
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route ||
        pathname.startsWith('/menu/') ||
        pathname.startsWith('/order/') ||
        pathname.startsWith('/api/menu') ||
        pathname.startsWith('/api/tables/qr') ||
        pathname.startsWith('/api/orders') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/seed')
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Get session using the Edge-compatible auth
    // Note: request as any casting because of NextAuth types mismatch in middleware
    const session = await auth();

    // Staff routes - require staff or admin
    if (pathname.startsWith('/staff')) {
        if (!session?.user || !['staff', 'admin'].includes(session.user.role)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Admin routes - require admin only
    if (pathname.startsWith('/admin')) {
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // API routes protection
    if (pathname.startsWith('/api/users')) {
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/staff/:path*',
        '/admin/:path*',
        '/api/users/:path*',
    ],
};
