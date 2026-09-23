"use client";

import type { LegalBlock } from "@/lib/content/legalBlocks";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * A section's paragraphs and lists, in the order they were written. Line breaks inside a
 * paragraph are kept, so text pasted into the admin panel reads on the page as it did there.
 */
export function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  const { t } = useLanguage();

  return (
    <>
      {blocks.map((block, i) =>
        block.kind === "list" ? (
          <ul key={i} className="my-3 flex flex-col gap-2 last:mb-0">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2.5 leading-relaxed text-muted">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="mb-3 whitespace-pre-line leading-relaxed text-muted last:mb-0">
            {t(block.text)}
          </p>
        ),
      )}
    </>
  );
}
