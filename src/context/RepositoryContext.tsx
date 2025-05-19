"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Repository } from "@/utils/types/Repository";
import { Graph } from "@/utils/types/Graph";
import { useAuth } from "@/context/AuthContext";
import { Node } from "@/utils/types/Node";
import { Link } from "@/utils/types/Link";

interface RepositoryContextType {
  activeRepository: Repository | null;
  setActiveRepository: (repository: Repository) => void;
  graphData: Graph | null;
  isLoading: boolean;
  error: Error | null;
  fetchRepoData: (repository: Repository) => Promise<void>;
}

const RepositoryContext = createContext<RepositoryContextType>({
  activeRepository: null,
  setActiveRepository: () => {},
  graphData: null,
  isLoading: false,
  error: null,
  fetchRepoData: async () => {},
});

export const useRepository = () => useContext(RepositoryContext);

export const RepositoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeRepository, setActiveRepository] = useState<Repository | null>(
    null
  );
  const [graphData, setGraphData] = useState<Graph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { octokit, isAuthenticated } = useAuth();

  const fetchRepoData = useCallback(
    async (repository: Repository) => {
      if (!octokit || !isAuthenticated) {
        setError(new Error("Not authenticated with GitHub."));
        return;
      }

      setIsLoading(true);
      setError(null);
      setActiveRepository(repository);

      async function fetchRepoContents(
        owner: string,
        repo: string,
        path: string = ""
      ) {
        const response = await octokit?.rest.repos.getContent({
          owner,
          repo,
          path,
        });
        const contents = Array.isArray(response?.data)
          ? response.data
          : [response?.data];
        return contents;
      }

      async function processContents(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contents: any[],
        currentPath: string = ""
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const foundFiles: any[] = [];
        for (const item of contents) {
          const fullPath = currentPath
            ? `${currentPath}/${item.name}`
            : item.name;
          if (item.type === "file" && /\.(js|ts|jsx|tsx)$/.test(item.name)) {
            foundFiles.push({ ...item, path: fullPath });
          } else if (item.type === "dir") {
            const subdirectoryContents = await fetchRepoContents(
              repository.owner.login,
              repository.name,
              fullPath
            );
            const subFiles = await processContents(
              subdirectoryContents,
              fullPath
            );
            foundFiles.push(...subFiles);
          }
        }
        return foundFiles;
      }

      try {
        const rootContents = await fetchRepoContents(
          repository.owner.login,
          repository.name,
          ""
        );
        const allFiles = await processContents(rootContents);
        console.log("All Found Files:", allFiles);

        const nodes: Array<Node> = [];
        const links: Array<Link> = [];
        const fileContents: { [path: string]: string } = {};

        for (const file of allFiles) {
          try {
            const fileResponse = (await octokit.rest.repos.getContent({
              owner: repository.owner.login,
              repo: repository.name,
              path: file.path,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })) as { data: any };
            const content = fileResponse.data.content
              ? Buffer.from(fileResponse.data.content, "base64").toString(
                  "utf-8"
                )
              : "";
            fileContents[file.path] = content;
            console.log(
              `Content of ${file.path} (first 50 chars):`,
              content.substring(0, 50).replace(/\n/g, "\\n")
            );
            nodes.push({
              id: file.path,
              name: file.name,
              type: "FILE",
              path: file.path,
              size: file.size,
              content: content,
              group: file.path.split("/").slice(0, -1).join("/") || "root",
            });
          } catch (error) {
            console.error(`Error fetching content for ${file.path}:`, error);
          }
        }

        console.log("All Created Nodes:", nodes);

        for (const file of allFiles) {
          if (fileContents[file.path]) {
            const imports = extractImports(fileContents[file.path], file.path);
            console.log(`Imports in ${file.path}:`, imports);
            for (const importedPath of imports) {
              const targetFile = allFiles.find(
                (f) =>
                  f.path.endsWith(importedPath) ||
                  f.path.endsWith(importedPath + ".js") ||
                  f.path.endsWith(importedPath + ".ts") ||
                  f.path.endsWith(importedPath + ".jsx") ||
                  f.path.endsWith(importedPath + ".tsx")
              );
              if (targetFile) {
                links.push({
                  source: file.path,
                  target: targetFile.path,
                  type: "import",
                });
              } else {
                const depNodeId = `dependency:${importedPath}`;
                if (!nodes.find((n) => n.id === depNodeId)) {
                  nodes.push({
                    id: depNodeId,
                    name: importedPath,
                    type: "DEPENDENCY",
                    path: depNodeId,
                    size: 0,
                    content: "",
                    group: "dependencies",
                  });
                }
                links.push({
                  source: file.path,
                  target: depNodeId,
                  type: "dependency",
                });
              }
            }
          }
        }

        console.log("All Created Links:", links);
        console.log("Graph Data:", { nodes, links });
        setGraphData({ nodes, links });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err);
        setGraphData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [octokit, isAuthenticated]
  );

  useEffect(() => {
    if (activeRepository && octokit && isAuthenticated) {
      fetchRepoData(activeRepository);
    }
  }, [activeRepository, octokit, isAuthenticated, fetchRepoData]);

  return (
    <RepositoryContext.Provider
      value={{
        activeRepository,
        setActiveRepository,
        graphData,
        isLoading,
        error,
        fetchRepoData,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
};

const extractImports = (content: string, filePath: string): Array<string> => {
  const importPatterns = [
    /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"\n]+)['"]/g,
    /require\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g,
    /import\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g, // Dynamic imports
    /import\s+([\w\.\*]+)/g, //simple imports
  ];
  const imports: Array<string> = [];
  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      let importPath = match[1];
      if (importPath.startsWith(".")) {
        try {
          importPath = new URL(
            importPath,
            `file:///${filePath}`
          ).pathname.slice(1);
        } catch (error) {
          console.warn(
            `Error creating URL for import '${importPath}' in '${filePath}':`,
            error
          );
        }
      }
      imports.push(importPath);
    }
  }
  return imports;
};

export default RepositoryProvider;
