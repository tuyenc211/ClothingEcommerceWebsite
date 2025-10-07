import { Metadata } from "next";
import TanstackQueryProvider from "@/lib/tanstack-query-provider";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// pages have to be rendered dynamically because supabase server component client uses cookies
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s - Zorvex",
    default: "Zorvex",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TanstackQueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
