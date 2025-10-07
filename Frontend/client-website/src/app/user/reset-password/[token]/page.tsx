"use client";

import { ResetPasswordForm } from "@/components/ui/reset-password-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const { token } = params;

  useEffect(() => {
    // Check auth status when page loads
    if (!authUser && !isCheckingAuth) {
      checkAuth();
    }
  }, [authUser, isCheckingAuth, checkAuth]);

  useEffect(() => {
    // Redirect if already logged in
    if (!isCheckingAuth && authUser) {
      toast.info("Bạn đã đăng nhập. Chuyển hướng về trang chủ...");
      router.push("/user");
      return;
    }
  }, [authUser, isCheckingAuth, router]);

  useEffect(() => {
    // Validate token format
    if (token) {
      // Basic token validation - you can add more sophisticated validation here
      if (token.length < 10) {
        setIsValidToken(false);
        toast.error("Liên kết khôi phục mật khẩu không hợp lệ");
      } else {
        setIsValidToken(true);
      }
    } else {
      setIsValidToken(false);
    }
  }, [token]);

  // Show loading while checking auth or validating token
  if (isCheckingAuth || isValidToken === null) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Don't show reset password form if already logged in
  if (authUser) {
    return null;
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Liên kết không hợp lệ</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. Vui
                lòng yêu cầu liên kết mới.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push("/user/forgot-password")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              Yêu cầu liên kết mới
            </button>
            <button
              onClick={() => router.push("/user/login")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
