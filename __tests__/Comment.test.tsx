import { render, screen } from '@testing-library/react';
import { Comment } from '../src/components/Comment';

jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 hours ago"),
}));

describe("Comment component", () => {
  const mockComment = {
    id: "1",
    node_id: "node1",
    user_id: "user123",
    content: "Test comment content",
    created_at: "2024-03-20T12:00:00Z",
  };

  it('renders comment content correctly', () => {
    render(<Comment comment={mockComment} />);
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
  });

  it('displays user ID in a truncated format', () => {
    render(<Comment comment={mockComment} />);
    expect(screen.getByText(/User user12/)).toBeInTheDocument();
  });

  it('shows formatted timestamp', () => {
    render(<Comment comment={mockComment} />);
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });
});
