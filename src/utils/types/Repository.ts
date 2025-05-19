export type Repository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
  };
}