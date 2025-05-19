import Header from "@/components/header/Header";
import RepositoryGraph from "@/components/RepositoryGraph";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <React.Fragment>
      <Header />
      <div className="grid grid-cols-1 gap-4">
        <RepositoryGraph />
      </div>
    </React.Fragment>
  )
}
