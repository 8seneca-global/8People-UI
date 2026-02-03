"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (token) {
      // If user is authenticated and on a public page, redirect to home
      if (isPublicPath) {
        router.push("/");
      }
    } else {
      // If user is not authenticated and on a private page, redirect to login
      if (!isPublicPath) {
        router.push("/login");
      }
    }
  }, [mounted, pathname, router]);

  // Optional: Show nothing while checking auth to prevent flash?
  // For now, render children to avoid blocking UI if check is fast or handled by redirects
  return <>{children}</>;
}
