import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/user/login") ||
    request.nextUrl.pathname.startsWith("/user/signup");

  const protectedRoutes = ["/user", "/cart/checkout", "/orders"];
  const isProtectedRoute = protectedRoutes.some(
    (route) => request.nextUrl.pathname.startsWith(route) && !isAuthPage
  );

  // Redirect authenticated users away from auth pages
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // Redirect unauthenticated users to login
  if (!accessToken && isProtectedRoute) {
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/cart/checkout", "/orders/:path*"],
};
