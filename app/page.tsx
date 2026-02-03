"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Perform a check or just redirect to dashboard which handles the auth check
    // Perform a check or just redirect to dashboard which handles the auth check
    router.push("/dashboard");
  }, [router]);

  return null;
}
