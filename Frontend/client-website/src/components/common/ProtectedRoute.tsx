"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode; // Custom loading component
}

const ProtectedRoute = ({
  children,
  redirectTo = "/user/login",
  fallback,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { authUser, isCheckingAuth, checkAuth, hasInitialized } =
    useAuthStore();

  useEffect(() => {
    // Chỉ check auth nếu chưa init hoặc chưa có user
    if (!hasInitialized) {
      checkAuth();
    }
  }, [hasInitialized, checkAuth]);
  if (!hasInitialized || isCheckingAuth) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }
  if (!authUser) {
    router.replace(redirectTo); // Dùng replace thay vì push
    return null;
  }

  // Render children chỉ khi đã có user
  return <>{children}</>;
};

export default ProtectedRoute;
