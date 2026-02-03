"use client";

/**
 * Auth Provider - Mock Mode
 *
 * This provider has been simplified for demo/mock mode.
 * No actual authentication checks are performed.
 * The app always acts as if the user is authenticated.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In mock mode, we simply pass through children without any auth checks
  return <>{children}</>;
}
