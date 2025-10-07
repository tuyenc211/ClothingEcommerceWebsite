"use client";

import { useEffect, ReactNode } from "react";
import useAuthStore from "@/stores/useAuthStore";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { hasInitialized, checkAuth } = useAuthStore();

  useEffect(() => {
    // Auto check auth khi app load lần đầu
    if (!hasInitialized) {
      checkAuth();
    }
  }, [hasInitialized, checkAuth]);

  return <>{children}</>;
}
