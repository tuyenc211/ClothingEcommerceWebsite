"use client";

import { ForgotPasswordForm } from "@/components/ui/forgot-password-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function ForgotPasswordPage() {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in (sau khi đã check auth xong)
    if (authUser) {
      router.push("/user");
    }
  }, [authUser, router]);
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
