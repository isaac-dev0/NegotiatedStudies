import { CommentTab } from "@/components/node/tabs/CommentTab";
import { createClient } from "../src/utils/supabase/client";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("../src/utils/supabase/client", () => {
  const mockFrom = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [] })),
      })),
    })),
    insert: jest.fn(() => Promise.resolve({ error: null })),
  }));

  const mockAuth = {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: { id: "mockUser" } } })
    ),
  };

  const mockCreateClient = jest.fn(() => ({
    from: mockFrom,
    auth: mockAuth,
  }));

  return { createClient: mockCreateClient };
});

describe("CommentTab component", () => {
  const mockNode = {
    id: "node1",
    name: "Test Node",
    type: "file",
    content: "Test content",
    path: "/test/path",
    size: 1000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no node is provided", () => {
    render(<CommentTab node={null} />);
    expect(screen.queryByText("Comments")).not.toBeInTheDocument();
  });

  it("fetches and displays comments for a node", async () => {
    const mockComments = [
      {
        id: "1",
        node_id: "node1",
        user_id: "user1",
        content: "Test comment",
        created_at: "2024-03-20T12:00:00Z",
      },
    ];

    (createClient as jest.Mock).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: mockComments }),
          }),
        }),
      }),
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({ data: { user: { id: "user1" } } })
        ),
      },
    });

    render(<CommentTab node={mockNode} />);

    await waitFor(() => {
      expect(screen.getByText("Test comment")).toBeInTheDocument();
    });
  });

  it("handles comment submission", async () => {
    const mockUser = { id: "user1" };
    const mockInsertResult = { data: null, error: null };

    (createClient as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser } })),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve(mockInsertResult)),
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [] })),
            })),
          })),
        })),
      });

    render(<CommentTab node={mockNode} />);

    const textarea = screen.getByPlaceholderText(/What exciting new comment/);
    fireEvent.change(textarea, { target: { value: "New comment" } });

    const submitButton = screen.getByText("Post Comment");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});
