"use client";

import { LoginForm } from "@/app/user/login/_components/login-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function LoginPage() {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã có user trong localStorage, redirect về /user
    // (trường hợp user đã login trước đó và localStorage còn data)
    if (authUser) {
      router.replace("/user");
    }
  }, [authUser, router]);

  // Nếu đã có user thì không render form
  if (authUser) {
    return null;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
