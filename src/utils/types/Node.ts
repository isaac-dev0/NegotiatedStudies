export type Node = {
  id: string;
  name: string;
  type: string;
  content: string;
  path: string;
  size: number;
  dependencies?: Array<string>;
  color?: string;
  [key: string]: unknown;
};
