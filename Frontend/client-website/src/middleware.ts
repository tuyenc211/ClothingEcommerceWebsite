import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  const pathname = request.nextUrl.pathname;

  // Auth pages
  const isAuthPage =
    pathname.startsWith("/user/login") ||
    pathname.startsWith("/user/signup") ||
    pathname.startsWith("/user/forgot-password");

  // Protected routes
  const protectedRoutes = [
    { path: "/user", requireAuth: true },
    { path: "/cart/checkout", requireAuth: true },
    { path: "/orders", requireAuth: true },
    { path: "/admin", requireAuth: true, adminOnly: true },
  ];

  const matchedRoute = protectedRoutes.find(
    (route) => pathname.startsWith(route.path) && !isAuthPage
  );

  // Redirect authenticated users away from auth pages
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // Redirect unauthenticated users to login
  if (!accessToken && matchedRoute?.requireAuth) {
    const loginUrl = new URL("/user/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin check (nếu cần - phải decode JWT)
  // if (accessToken && matchedRoute?.adminOnly) {
  //   // Decode JWT và check role
  //   // Nếu không phải admin, redirect về home
  // }

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
