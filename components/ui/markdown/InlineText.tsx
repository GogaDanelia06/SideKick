import { parseInline } from "@/lib/markdown/inline";

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        if (part.kind === "strong") return <strong key={i} className="font-semibold">{part.text}</strong>;
        if (part.kind === "em") return <em key={i}>{part.text}</em>;
        if (part.kind === "code") {
          return (
            <code key={i} className="rounded-[4px] bg-soft px-1 py-px font-mono text-[12px]">
              {part.text}
            </code>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}
