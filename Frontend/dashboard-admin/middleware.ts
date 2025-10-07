import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ✅ Chỉ để middleware xử lý các tác vụ đơn giản
  // Client-side ProtectedRoute sẽ xử lý authentication

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)"],
};
