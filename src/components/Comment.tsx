import { Comment as CommentType } from "@/utils/types/Comment";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CommentProps {
  comment: CommentType;
  className?: string;
}

export function Comment({ comment, className }: CommentProps) {
  return (
    <div
      data-testid="comment"
      className={cn("flex gap-4 p-4 border-b last:border-b-0", className)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={`https://avatar.vercel.sh/${comment.user_id}`}
          alt="User avatar"
        />
        <AvatarFallback>
          {comment.user_id.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            User {comment.user_id.slice(0, 6)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
