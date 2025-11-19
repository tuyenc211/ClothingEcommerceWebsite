// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const protectedRoutes = [{ path: "/", requireAuth: true }];
  const matchedRoute = protectedRoutes.find(
    (route) => pathname.startsWith(route.path) && !isLogin
  );
  // Đã có token mà vào /login -> đẩy về /
  if (refreshToken && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!refreshToken && matchedRoute?.requireAuth) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/", "/((?!_next|api|favicon.ico).*)", "/login"],
};
