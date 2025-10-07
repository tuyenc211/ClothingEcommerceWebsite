"use client";

import { LoginForm } from "@/components/ui/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function LoginPage() {
  const { authUser, isCheckingAuth, checkAuth, hasInitialized } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Nếu chưa init thì check auth
    if (!hasInitialized) {
      checkAuth();
    }
  }, [hasInitialized, checkAuth]);

  useEffect(() => {
    // Chỉ redirect khi đã init và có user
    if (hasInitialized && authUser && !isCheckingAuth) {
      router.replace("/user");
    }
  }, [authUser, isCheckingAuth, hasInitialized, router]);

  // Show loading while checking auth
  if (isCheckingAuth || !hasInitialized) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  // Nếu đã có user thì không render gì (sẽ redirect)
  if (authUser) {
    return <LoadingSpinner />;
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
