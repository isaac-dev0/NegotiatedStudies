"use client";

import { useRepository } from "@/context/RepositoryContext";
import { Node } from "@/utils/types/Node";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import NodeTabs from "./node/NodeTabs";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function RepositoryGraph() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { graphData, isLoading, error } = useRepository();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClickNode = useCallback((node: any) => {
    setSelectedNode(node as Node);
  }, []);

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
        <div className="text-lg">Loading Graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
        <div className="text-lg text-red-500">
          Failed to load repository data.
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--header-height))]">
        <div className="text-lg">
          Select a repository to view its code graph.
        </div>
      </div>
    );
  }

  console.log("Graph Data:", graphData);

  return (
    <>
      <div className="h-[calc(100vh-var(--header-height))] w-full">
        <ForceGraph2D
          graphData={graphData}
          nodeColor={(node) => node.color}
          nodeLabel={(node) => node.name}
          onNodeClick={handleClickNode}
          nodeRelSize={7}
          linkWidth={2}
          linkColor={() => "#FFF"}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          cooldownTicks={100}
        />
      </div>
      <Sheet
        open={!!selectedNode}
        onOpenChange={(open) => !open && setSelectedNode(null)}
      >
        <SheetContent className="!max-w-fit !min-w-[400px]">
          <SheetHeader>
            <SheetTitle>{selectedNode?.name}</SheetTitle>
          </SheetHeader>
          <NodeTabs node={selectedNode} />
        </SheetContent>
      </Sheet>
    </>
  );
}
