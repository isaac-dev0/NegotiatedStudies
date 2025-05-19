"use client";

import { signInWithGithub } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGithub();
    } catch (error) {
      console.error("Sign in error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to sign in with GitHub"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
          <Github className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Connecting..." : "Sign in with GitHub"}</span>
        </Button>
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
