"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { PlayCircle } from "lucide-react";

/**
 * Login Page - Mock Mode
 *
 * This page has been simplified for demo/mock mode.
 * Instead of Google OAuth, it shows a simple "Enter Demo" button
 * that redirects directly to the dashboard.
 */
export default function LoginPage() {
  const router = useRouter();

  const handleEnterDemo = () => {
    // In mock mode, just redirect to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-sm border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to 8People
          </CardTitle>
          <CardDescription>HR Management System Demo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This is a demo version with mock data.
            </p>
            <p className="text-xs text-muted-foreground/70">
              No authentication required.
            </p>
          </div>

          <Button
            onClick={handleEnterDemo}
            size="lg"
            className="w-full max-w-[200px] gap-2 font-semibold"
          >
            <PlayCircle className="h-5 w-5" />
            Enter Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
