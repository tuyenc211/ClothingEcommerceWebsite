// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname, origin } = request.nextUrl;

  const isAuthPage = pathname === "/login";
  const isAdminPath = pathname.startsWith("/admin");

  // Nếu đã login mà vào /login -> đẩy về /admin
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  // Nếu CHƯA login mà vào /admin -> đẩy về /login
  if (!accessToken && isAdminPath) {
    const url = new URL("/login", origin);
    // optional: quay lại trang cũ sau khi login
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // "/" -> điều hướng theo trạng thái đăng nhập
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(accessToken ? "/admin" : "/login", origin)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*"],
};
