"use client";

import { ForgotPasswordForm } from "@/components/ui/forgot-password-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function ForgotPasswordPage() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check auth status when page loads (chỉ khi chưa có user)
    if (!authUser && !isCheckingAuth) {
      checkAuth();
    }
  }, [authUser, isCheckingAuth, checkAuth]);

  useEffect(() => {
    // Redirect if already logged in (sau khi đã check auth xong)
    if (!isCheckingAuth && authUser) {
      router.push("/user");
    }
  }, [authUser, isCheckingAuth, router]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Don't show forgot password form if already logged in
  if (authUser) {
    return null;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
