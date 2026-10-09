import { Fragment } from "react";
import clsx from "clsx";
import type { Block, Inline } from "@/lib/markdown/nodes";
import { parseMarkdown } from "@/lib/markdown/parse";

const HEADING = {
  1: "mb-2 mt-6 text-[22px] font-semibold leading-snug",
  2: "mb-2 mt-5 text-[19px] font-semibold leading-snug",
  3: "mb-1.5 mt-4 text-[16px] font-semibold",
  4: "mb-1 mt-3 text-[14px] font-semibold",
  5: "mb-1 mt-3 text-[13px] font-semibold text-muted",
  6: "mb-1 mt-3 text-[13px] font-medium text-muted",
} as const;

const CELL = "border border-border px-3 py-1.5";

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.kind) {
          case "text":
            return <Fragment key={i}>{node.text}</Fragment>;
          case "strong":
            return <strong key={i} className="font-semibold"><Inlines nodes={node.children} /></strong>;
          case "em":
            return <em key={i}><Inlines nodes={node.children} /></em>;
          case "del":
            return <del key={i} className="text-muted"><Inlines nodes={node.children} /></del>;
          case "code":
            return <code key={i} className="rounded bg-soft px-1 py-0.5 font-mono text-[0.9em]">{node.text}</code>;
          case "link":
            return (
              <a key={i} href={node.href} target="_blank" rel="noopener noreferrer nofollow" className="text-blue underline underline-offset-2">
                <Inlines nodes={node.children} />
              </a>
            );
          case "br":
            return <br key={i} />;
        }
      })}
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((block, i) => <BlockView key={i} block={block} />)}</>;
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return <Tag className={HEADING[block.level]}><Inlines nodes={block.children} /></Tag>;
    }
    case "paragraph":
      return <p className="my-2 leading-relaxed"><Inlines nodes={block.children} /></p>;
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i} className={clsx("leading-relaxed [&>ol]:my-1 [&>p]:my-0 [&>ul]:my-1", item.checked !== null && "list-none")}>
          {item.checked === null ? null : <span aria-hidden className="mr-1.5 text-muted">{item.checked ? "☑" : "☐"}</span>}
          <Blocks blocks={item.children} />
        </li>
      ));
      return block.ordered ? (
        <ol start={block.start} className="my-2 list-decimal space-y-1 pl-6">{items}</ol>
      ) : (
        <ul className="my-2 list-disc space-y-1 pl-6">{items}</ul>
      );
    }
    case "quote":
      return <blockquote className="my-3 border-l-2 border-border pl-4 text-muted"><Blocks blocks={block.children} /></blockquote>;
    case "code":
      return <pre className="my-3 overflow-x-auto rounded-[8px] bg-soft p-3 font-mono text-[12px] leading-relaxed"><code>{block.text}</code></pre>;
    case "rule":
      return <hr className="my-5 border-border2" />;
    case "table":
      return (
        <div className="my-3 overflow-x-auto [overflow-wrap:normal]">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {block.header.map((cell, i) => (
                  <th key={i} style={{ textAlign: block.align[i] ?? "left" }} className={clsx(CELL, "bg-soft font-semibold")}><Inlines nodes={cell} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, i) => (
                    <td key={i} style={{ textAlign: block.align[i] ?? "left" }} className={CELL}><Inlines nodes={cell} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** Markdown drawn as formatted text: headings, lists, bold. Built from React elements, never from HTML. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={clsx("text-sm text-ink [overflow-wrap:anywhere] [&>:first-child]:mt-0 [&>:last-child]:mb-0", className)}>
      <Blocks blocks={parseMarkdown(source)} />
    </div>
  );
}
