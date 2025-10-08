import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Đọc access token từ httpOnly cookie
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Đọc user data từ localStorage (chỉ lưu user info, không lưu token)
  const authStorage = request.cookies.get("auth-storage")?.value;

  let authUser = null;
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      authUser = parsed.state?.authUser;
    } catch (error) {
      console.error("Error parsing auth storage:", error);
    }
  }

  const isAuthenticated = accessToken && authUser;
  const hasRefreshToken = refreshToken;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/user/login") ||
    request.nextUrl.pathname.startsWith("/user/signup") ||
    request.nextUrl.pathname.startsWith("/user/forgot-password") ||
    request.nextUrl.pathname.startsWith("/user/reset-password");

  // Protected routes
  const protectedRoutes = [
    "/user",
    "/user/orders",
    "/cart/checkout",
    "/orders",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) => request.nextUrl.pathname.startsWith(route) && !isAuthPage
  );

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has refresh token but no access token, let the app handle refresh
  if (!accessToken && hasRefreshToken && isProtectedRoute) {
    // Let the request continue, axios interceptor will handle refresh
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/cart/checkout", "/orders/:path*"],
};
