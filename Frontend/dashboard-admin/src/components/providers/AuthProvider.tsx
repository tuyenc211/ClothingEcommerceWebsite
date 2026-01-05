"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const refresh = useAuthStore((state) => state.refresh);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refresh();
      } catch (error) {
        console.log("Auth init failed:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [refresh]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Đang tải...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
