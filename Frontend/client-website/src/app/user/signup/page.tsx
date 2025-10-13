"use client";

import { SignupForm } from "@/components/ui/signup-form";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();

  const handleSignup = async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => {
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber, // map phoneNumber -> phone cho API
      });
      // Sau khi đăng ký thành công, chuyển về trang user hoặc login
        router.push("/user/login");
    } catch (error) {
      // Error đã được xử lý trong store (toast)
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm handleSignup={handleSignup} isLoading={isSigningUp} />
      </div>
    </div>
  );
}