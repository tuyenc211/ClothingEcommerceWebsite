"use client";

import { useEffect, ReactNode, useRef } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

const ProtectedRoute = ({
  children,
  redirectTo = "/user/login",
  fallback,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { authUser, isCheckingAuth, checkAuth, hasInitialized } = useAuthStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Chỉ check auth nếu chưa init và chưa check
    if (!hasInitialized && !hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, [hasInitialized, checkAuth]);

  useEffect(() => {
    // Redirect nếu không có user và đã check xong
    if (hasInitialized && !authUser && !isCheckingAuth) {
      router.replace(redirectTo);
    }
  }, [hasInitialized, authUser, isCheckingAuth, redirectTo, router]);

  // Loading state
  if (!hasInitialized || isCheckingAuth) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    );
  }

  // Not authenticated
  if (!authUser) {
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default ProtectedRoute;
