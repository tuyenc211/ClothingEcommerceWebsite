import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  const pathname = request.nextUrl.pathname;

  // Auth pages cho dashboard-admin
  const isAuthPage = pathname.startsWith("/login");

  // Protected routes cho dashboard-admin
  const protectedRoutes = [
    { path: "/admin", requireAuth: true, adminOnly: true },
  ];

  const matchedRoute = protectedRoutes.find(
    (route) => pathname.startsWith(route.path) && !isAuthPage
  );

  // Redirect authenticated users away from auth pages
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Redirect unauthenticated users to login
  if (!accessToken && matchedRoute?.requireAuth) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root page to appropriate location
  if (pathname === "/") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*"],
};
