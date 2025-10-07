"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";

export default function HomePage() {
  const router = useRouter();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      router.push("/admin");
    } else {
      router.push("/login");
    }
  }, [authUser, router]);

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
