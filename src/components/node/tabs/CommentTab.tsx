import { Comment as CommentComponent } from "@/components/Comment";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { Comment } from "@/utils/types/Comment";
import { Node } from "@/utils/types/Node";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CommentTabProps {
  node: Node | null;
}

export function CommentTab({ node }: CommentTabProps) {
  const [comments, setComments] = useState<Array<Comment>>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!node) return;
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select()
      .eq("node_id", node.id)
      .order("created_at", { ascending: false });
      
    if (data) {
      setComments(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [node]);

  const handleSubmit = async () => {
    if (!node || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to comment");
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          node_id: node.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!node) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Comments</h1>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentComponent key={comment.id} comment={comment} />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <Textarea 
          placeholder="What exciting new comment will you leave here?" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}