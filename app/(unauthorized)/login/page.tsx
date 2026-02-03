"use client";

import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { toast } from "sonner";
import { useLoginMutation } from "@/modules/auth/api";

// Placeholder Client ID - Update this in apps/web/.env.local
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function LoginForm() {
  const router = useRouter();

  const { mutate: login, isPending } = useLoginMutation({
    onSuccess: (data) => {
      // Store token (consider using a better storage strategy or cookie in real app)
      localStorage.setItem("token", data.access_token);
      toast.success("Login successful");
      router.push("/");
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Authentication failed");
    },
  });

  const handleGoogleSuccess = (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("No ID Token received from Google");
      return;
    }
    login({ idToken });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm border-0!">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome
          </CardTitle>
          <CardDescription>Sign in to access the HRM System</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {/* 
            Using standard GoogleLogin component for ID Token flow.
            We use a large width and 'outline' theme to blend with the UI.
          */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}
              theme="outline"
              size="large"
              width="300"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          {isPending && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Authenticating...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
