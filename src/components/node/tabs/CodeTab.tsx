import { Node } from "@/utils/types/Node";
import { Editor } from "@monaco-editor/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CodeTabProps {
  node: Node;
}

export function CodeTab({ node }: CodeTabProps) {
  const accordions = [
    {
      value: "metadata",
      trigger: "Metadata",
      content: (
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Name:</span> {node?.name}
          </div>
          <div>
            <span className="font-semibold">Type:</span> {node?.type}
          </div>
          <div>
            <span className="font-semibold">Size:</span> {node?.size} bytes
          </div>
          <div>
            <span className="font-semibold">Path:</span> {node?.path}
          </div>
          <div>
            <span className="font-semibold">
              Dependencies:
              {node?.dependencies?.map((dependency) => (
                <span key={dependency}>{dependency}</span>
              ))}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Editor
          height="33vh"
          defaultLanguage="typescript"
          value={node.content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
          }}
        />
      </div>
      <div className="border-t">
        <Accordion type="single" collapsible className="w-full">
          {accordions.map((accordion) => (
            <AccordionItem className="p-2" key={accordion.value} value={accordion.value}>
              <AccordionTrigger>{accordion.trigger}</AccordionTrigger>
              <AccordionContent>{accordion.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
