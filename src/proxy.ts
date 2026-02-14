import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy function for Next.js 16
 *
 * This performs optimistic checks only - redirects unauthenticated users.
 * Full authorization is handled in Server Components and API routes.
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/forgot-password") ||
    request.nextUrl.pathname.startsWith("/reset-password");

  // If on auth page but already logged in, redirect to dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not on auth page and not logged in, redirect to login
  if (!isAuthPage && !isAuth) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth API routes)
     * - api/register (registration endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets
     */
    "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
