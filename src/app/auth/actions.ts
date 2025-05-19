"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithGithub(next?: string) {
  const supabase = await createClient();

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo
    },
  });

  if (error) {
    console.log("GitHub OAuth Error:", error);
    return { error };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return { error: "Failed to get OAuth URL." };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("An error occured whilst signing out:", error);
    throw error;
  }

  redirect("/login");
}
