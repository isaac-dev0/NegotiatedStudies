import { Octokit } from "@octokit/rest";

export type AuthState = {
  octokit: Octokit | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
};
