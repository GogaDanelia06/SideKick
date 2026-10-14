import { parseBlocks, type Block } from "@/lib/markdown/blocks";
import { InlineText } from "./InlineText";

const HEADING_TAG = ["h3", "h4", "h5", "h6", "h6", "h6"] as const;
const HEADING_SIZE = ["text-[17px]", "text-[15px]", "text-[14px]", "text-[13px]", "text-[13px]", "text-[13px]"];

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading": {
      const Tag = HEADING_TAG[block.level - 1];
      return (
        <Tag className={`mt-2 font-semibold leading-snug first:mt-0 ${HEADING_SIZE[block.level - 1]}`}>
          <InlineText text={block.text} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="whitespace-pre-line">
          <InlineText text={block.text} />
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={`flex flex-col gap-1 pl-5 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "quote":
      return (
        <blockquote className="whitespace-pre-line border-l-2 border-border pl-3 text-muted">
          <InlineText text={block.text} />
        </blockquote>
      );
    case "code":
      return (
        <pre className="whitespace-pre-wrap rounded-[6px] bg-soft p-3 font-mono text-[12px]">{block.text}</pre>
      );
    case "rule":
      return <hr className="border-border2" />;
  }
}

export function MarkdownView({ source, className }: { source: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-2.5 text-[13px] leading-relaxed ${className ?? ""}`}>
      {parseBlocks(source).map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
