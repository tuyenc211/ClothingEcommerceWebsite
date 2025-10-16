// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const protectedRoutes = [
    { path: "/admin", requireAuth: true },
    { path: "/", requireAuth: true },
  ];
  const matchedRoute = protectedRoutes.find(
    (route) => pathname.startsWith(route.path) && !isLogin
  );
  // Đã có token mà vào /login -> đẩy về /admin
  if (accessToken && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (!accessToken && matchedRoute?.requireAuth) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/", "/admin/:path*"],
};
