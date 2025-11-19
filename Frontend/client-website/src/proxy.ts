import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  // Check refreshToken cookie thay vì accessToken
  // vì backend set refreshToken vào cookie, còn accessToken lưu trong localStorage
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const pathname = request.nextUrl.pathname;

  // Auth pages
  const isAuthPage =
    pathname.startsWith("/user/login") ||
    pathname.startsWith("/user/signup") ||
    pathname.startsWith("/user/forgot-password") ||
    pathname.startsWith("/user/authenticate") ||
    pathname.startsWith("/user/reset-password");

  // Protected routes
  const protectedRoutes = [
    { path: "/user", requireAuth: true },
    { path: "/cart/checkout", requireAuth: true },
    { path: "/orders", requireAuth: true },
  ];

  const matchedRoute = protectedRoutes.find(
    (route) => pathname.startsWith(route.path) && !isAuthPage
  );

  // Redirect authenticated users away from auth pages
  if (refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // Redirect unauthenticated users to login
  if (!refreshToken && matchedRoute?.requireAuth) {
    const loginUrl = new URL("/user/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*",
    "/cart/checkout",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
