import { JSX, ReactNode } from "react";

export type Tab = {
  id: string;
  label: string;
  icon: ReactNode;
  content: JSX.Element;
  showBadgeCount: boolean;
  badgeCount?: number;
};