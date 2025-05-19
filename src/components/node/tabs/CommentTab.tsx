import { Node } from "@/utils/types/Node";

interface CommentTabProps {
  node: Node | null;
}

export function CommentTab({ node }: CommentTabProps) {
  return <h1>Hi {node?.name}</h1>
}