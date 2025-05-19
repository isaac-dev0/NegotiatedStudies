"use client";

import { createClient } from "@/utils/supabase/client";
import { AuthState } from "@/utils/types/AuthState";
import { Octokit } from "@octokit/rest";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const initialAuthState: AuthState = {
  octokit: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

type AuthContextType = {
  authState: AuthState;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  authState: initialAuthState,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const supabase = useMemo(() => createClient(), []);

  const initialiseOctokit = useCallback(async (session: Session | null) => {
    if (!session?.provider_token) {
      setAuthState((prev) => ({
        ...prev,
        octokit: null,
        isAuthenticated: false,
      }));
      return;
    }

    try {
      const client = new Octokit({ auth: session.provider_token });
      await client.request("GET /user");
      setAuthState((prev) => ({
        ...prev,
        octokit: client,
        isAuthenticated: true,
        error: null,
      }));
    } catch (error) {
      console.error("GitHub authentication error:", error);
      setAuthState((prev) => ({
        ...prev,
        octokit: null,
        isAuthenticated: false,
        error:
          error instanceof Error ? error : new Error("Authentication failed."),
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await supabase.auth.signOut();
      setAuthState(initialAuthState);
    } catch (error) {
      console.error("Sign out error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("Failed to sign out"),
      }));
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const handleAuthStateChange = async (
      event: string,
      session: Session | null
    ) => {
      if (!isMounted) return;

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await initialiseOctokit(session);
      } else if (event === "SIGNED_OUT") {
        setAuthState(initialAuthState);
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    const init = async () => {
      if (!isMounted) return;
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        await initialiseOctokit(session);
      } catch (error) {
        console.error("Auth initialisation error:", error);
        setAuthState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error
              : new Error("Authentication failed."),
          octokit: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      } finally {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, initialiseOctokit]);

  const value = useMemo(() => ({
    authState, signOut
  }), [authState, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return { ...context.authState, signOut: context.signOut };
}
