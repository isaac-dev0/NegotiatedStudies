import { render, screen, waitFor } from "@testing-library/react";
import Header from "@/components/header/Header";
import { useAuth } from "@/context/AuthContext";
import { useRepository } from "@/context/RepositoryContext";
import { signOut } from "@/app/auth/actions";

jest.mock("../src/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../src/context/RepositoryContext", () => ({
  useRepository: jest.fn(),
}));

jest.mock("../src/app/auth/actions", () => ({
  signOut: jest.fn(),
}))

const mockOctokit = {
  rest: {
    repos: {
      listForAuthenticatedUser: jest.fn(() =>
        Promise.resolve({ data: [{ id: 1, name: "Repo1" }] })
      ),
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("Header Component", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      octokit: mockOctokit,
      isAuthenticated: true,
      isLoading: false,
    });
    (useRepository as jest.Mock).mockReturnValue({
      setActiveRepository: jest.fn(),
    });
    (signOut as jest.Mock).mockClear();
  });

  it("Renders the Switcher component", () => {
    render(<Header />);
    expect(screen.getByText("Select a repository")).toBeInTheDocument();
  });

  it("Renders the Sign Out button", () => {
    render(<Header />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls signOut when the Sign Out button is clicked", async () => {
    render(<Header />);
    const signOutButton = screen.getByText("Sign Out");
    signOutButton.click();
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("fetches repositories on mount and sets the first one as active", async () => {
    render(<Header />);
    await waitFor(() => {
      expect(
        mockOctokit.rest.repos.listForAuthenticatedUser
      ).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(
        (useRepository as jest.Mock).mock.results[0].value.setActiveRepository
      ).toHaveBeenCalledWith({ id: 1, name: "repo1" });
    });
  });

  it("does not fetch repositories if not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      octokit: mockOctokit,
      isAuthenticated: false,
      isLoading: false,
    });
    render(<Header />);
    expect(
      mockOctokit.rest.repos.listForAuthenticatedUser
    ).not.toHaveBeenCalled();
  });

  it('renders "Loading..." in Switcher when isLoading is true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      octokit: mockOctokit,
      isAuthenticated: true,
      isLoading: true,
    });
    render(<Header />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
