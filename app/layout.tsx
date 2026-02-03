import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/lib/theme-provider";
import { ReactQueryProvider } from "@/modules/core/components/providers/query-provider";
import { AuthProvider } from "@/modules/core/components/providers/auth-provider";
import { Toaster } from "@/modules/core/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "8People - HR Management",
  description:
    "Admin CMS for managing organization structure and employee onboarding",
  icons: {
    icon: "/favicon.png",
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
