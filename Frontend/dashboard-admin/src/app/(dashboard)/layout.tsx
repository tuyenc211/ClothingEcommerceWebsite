"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/ui/app-sidebar";
import AuthProvider from "@/components/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto p-6">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
