"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";

// ✅ Danh sách các route công khai (không cần auth)
const PUBLIC_ROUTES = ["/login", "/signup"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, isCheckingAuth, checkAuth, hasInitialized } =
    useAuthStore();

  // ✅ Check xem có phải public route không
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    // ✅ Nếu là public route -> không cần check auth
    if (isPublicRoute) return;

    // Chỉ check auth khi chưa initialize
    if (!hasInitialized) {
      checkAuth();
    }
  }, [hasInitialized, checkAuth, isPublicRoute]);

  useEffect(() => {
    // ✅ Nếu là public route -> không redirect
    if (isPublicRoute) return;

    // Nếu đã initialize và không có user -> redirect về login
    if (hasInitialized && !authUser && !isCheckingAuth) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [
    authUser,
    hasInitialized,
    isCheckingAuth,
    router,
    pathname,
    isPublicRoute,
  ]);

  // ✅ Nếu là public route -> render ngay
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Hiển thị loading khi đang check auth hoặc chưa initialize
  if (!hasInitialized || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinner */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có user -> return null (đang redirect)
  if (!authUser) {
    return null;
  }

  // Có user -> hiển thị children
  return <>{children}</>;
}
