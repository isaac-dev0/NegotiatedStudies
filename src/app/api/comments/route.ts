import { createClient } from "@/utils/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { nodeId, content } = req.body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return res.status(400).json({ error: "Not authenticated." });
    }

    if (!nodeId || !content) {
      return res.status(400).json({ error: "Missing nodeId or comment text." });
    }

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({ nodeId: nodeId, user_id: user.id, content })
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ error: "Failed to add comment." });
    }

    return res.status(201).json(newComment);
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;