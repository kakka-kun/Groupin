import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公開パス（認証不要）
const publicPaths = ['/', '/login', '/signup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get('groupin_session');
    const isAuthenticated = !!sessionCookie?.value;

    // 公開パスはそのまま通過
    if (publicPaths.includes(pathname)) {
        // ログイン済みユーザーが /login, /signup にアクセスしたらダッシュボードへ
        if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
            return NextResponse.redirect(new URL('/app', request.url));
        }
        return NextResponse.next();
    }

    // /app/* へのアクセス時、未認証なら /login へリダイレクト
    if (pathname.startsWith('/app')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // /admin*, /admin-setup へのアクセスチェック
    if (pathname.startsWith('/admin')) {
        // admin-setup は特別扱い（admin/adminでログイン直後のため、クッキーがない場合もあるが基本はフロー制御）
        // ここでは単純化して、/admin 配下は strict にチェック
        if (pathname === '/admin-setup') {
            return NextResponse.next();
        }

        const isAdmin = request.cookies.get('groupin_admin')?.value === 'true';
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/signup', '/app/:path*'],
};
