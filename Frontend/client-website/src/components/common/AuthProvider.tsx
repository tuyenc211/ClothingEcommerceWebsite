"use client";

import { useEffect, ReactNode, useRef } from "react";
import useAuthStore from "@/stores/useAuthStore";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { hasInitialized, checkAuth } = useAuthStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Chỉ check auth một lần duy nhất khi mount
    if (!hasInitialized && !hasChecked.current) {
      hasChecked.current = true;
      checkAuth();
    }
  }, []); // Empty dependency array - chỉ chạy một lần

  return <>{children}</>;
}
