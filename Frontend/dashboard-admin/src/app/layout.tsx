import { Metadata } from "next";
// import TanstackQueryProvider from "@/lib/tanstack-query-provider";

import "@/app/globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// pages have to be rendered dynamically because supabase server component client uses cookies
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    template: "%s - Atino Admin Dashboard",
    default: "Atino Admin Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* <TanstackQueryProvider > */}
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          richColors={true}
          toastOptions={{
            style: {
              borderRadius: "0px",
              boxShadow:
                "2px 2px 0px rgba(0,0,0,1), 5px 5px 0px rgba(120,120,120,1",
            },
          }}
        />
        {/* </TanstackQueryProvider> */}
      </body>
    </html>
  );
}
