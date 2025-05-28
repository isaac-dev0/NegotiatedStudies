import { createClient } from "@/utils/supabase/server";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { nodeId } = req.query;

    if (!nodeId || typeof nodeId !== "string") {
      return res.status(400).json({ error: "Missing or invalid ID." });
    }

    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("comments")
      .select("id, content, created_at")
      .eq("node_id", nodeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments." });
    }

    return res.status(200).json(comments);
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} not allowed.`);
  }
};

export default handler;
