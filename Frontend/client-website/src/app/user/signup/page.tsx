"use client";

import { SignupForm } from "@/app/user/signup/_components/signup-form";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { SignUpData } from "@/types";
export default function SignupPage() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();

  const handleSignup = async (data: SignUpData) => {
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      router.push("/user/login");
    } catch (error) {
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
