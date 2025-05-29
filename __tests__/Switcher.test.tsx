import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Switcher from "@/components/header/Switcher";
import { Repository } from "@/utils/types/Repository";

const mockSetRepository = jest.fn();
const mockRepositories: Repository[] = [
  {
    id: 1,
    name: "repo1",
    full_name: "owner/repo1",
    private: false,
    html_url: "",
    owner: {
      login: "",
      id: 0,
      avatar_url: "",
    },
  },
  {
    id: 2,
    name: "repo2",
    full_name: "owner/repo2",
    private: false,
    html_url: "",
    owner: {
      login: "",
      id: 0,
      avatar_url: "",
    },
  },
];

describe("Switcher Component", () => {
  beforeEach(() => {
    mockSetRepository.mockClear();
  });

  it('renders "No repositories found." when repositories array is empty', () => {
    render(
      <Switcher
        repositories={[]}
        setRepository={mockSetRepository}
        isLoading={false}
      />
    );
    expect(screen.getByText("No repositories found.")).toBeInTheDocument();
  });

  it('renders "Loading..." when isLoading is true', () => {
    render(
      <Switcher
        repositories={mockRepositories}
        setRepository={mockSetRepository}
        isLoading={true}
      />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the select trigger with the first repository name by default", () => {
    render(
      <Switcher
        repositories={mockRepositories}
        setRepository={mockSetRepository}
        isLoading={false}
      />
    );
    expect(screen.getByText("repo1")).toBeInTheDocument();
  });

  it("opens the select content when the trigger is clicked", async () => {
    render(
      <Switcher
        repositories={mockRepositories}
        setRepository={mockSetRepository}
        isLoading={false}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("Repositories")).toBeInTheDocument();
      expect(screen.getByText("repo1")).toBeInTheDocument();
      expect(screen.getByText("repo2")).toBeInTheDocument();
    });
  });

  it("calls setRepository with the selected repository when a new repository is chosen", async () => {
    render(
      <Switcher
        repositories={mockRepositories}
        setRepository={mockSetRepository}
        isLoading={false}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      fireEvent.click(screen.getByText("repo2"));
    });
    expect(mockSetRepository).toHaveBeenCalledWith(mockRepositories[1]);
  });
});
