"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  requireStaff?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireAdmin = false,
  requireStaff = false,
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const { authUser, hasRole, isAdmin, isAdminOrStaff } = useAuthStore();
  const hasAccess = (() => {
    if (requireAdmin) return isAdmin();
    if (requireStaff) return isAdminOrStaff();
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.some((role) => hasRole(role));
    }
    return true;
  })();

  useEffect(() => {
    if (authUser && !hasAccess) {
      router.push("/");
    }
  }, [authUser, hasAccess, router]);
  return <>{children}</>;
}
