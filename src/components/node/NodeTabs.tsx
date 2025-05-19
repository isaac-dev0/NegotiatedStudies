import { Node } from "@/utils/types/Node";
import { Badge, Code, MessageCircle } from "lucide-react";
import { useState } from "react";
import { CodeTab } from "./tabs/CodeTab";
import { CommentTab } from "./tabs/CommentTab";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import { Tab } from "@/utils/types/Tab";

interface NodeTabsProps {
  node: Node | null;
}

export default function NodeTabs({ node }: NodeTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("code");

  if (!node) return null;

  const tabs: Array<Tab> = [
    {
      id: "code",
      label: "Code",
      icon: <Code />,
      content: <CodeTab node={node} />,
      showBadgeCount: false,
    },
    {
      id: "comments",
      label: "Comments",
      icon: <MessageCircle />,
      content: <CommentTab node={node} />,
      showBadgeCount: false,
    },
  ];

  return (
    <>
      <header className="flex h-(--header-height) border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <Tabs
            defaultValue="code"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent">
              {tabs.map((tab: Tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-none data-[state=active]:shadow-none relative",
                    "border-b-1 border-transparent data-[state=active]:border-b-primary dark:data-[state=active]:border-b-primary",
                    "focus-visible:bg-accent/50 focus-visible:border-transparent"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.showBadgeCount === true && (
                    <Badge>{tab.badgeCount}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>
      <div>{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </>
  );
}
