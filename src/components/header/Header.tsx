"use client";

import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import Switcher from "@/components/header/Switcher";
import { useEffect, useState } from "react";
import { Repository } from "@/utils/types/Repository";
import { useAuth } from "@/context/AuthContext";
import { useRepository } from "@/context/RepositoryContext";

export default function Header() {
  const [repositories, setRepositories] = useState<Array<Repository>>([]);

  const { octokit, isAuthenticated, isLoading } = useAuth();
  const { setActiveRepository } = useRepository();

  useEffect(() => {
    if (!octokit || !isAuthenticated) return;

    async function fetchRepositories() {
      try {
        if (!octokit) return;
        const res = await octokit.rest.repos.listForAuthenticatedUser();
        setRepositories(res.data);
        if (res.data.length > 0) {
          setActiveRepository(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    }

    fetchRepositories();
  }, [octokit, isAuthenticated, setActiveRepository]);

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4 py-2">
        <Switcher
          repositories={repositories}
          setRepository={setActiveRepository}
          isLoading={isLoading}
        />
        <div className="flex flex-row w-full sm:ml-auto sm:w-auto">
          <Button variant="default" onClick={signOut} className="ml-2">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
