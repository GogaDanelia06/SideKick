import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * The small blue label above a section heading.
 *
 * A slash rather than an icon, everywhere. Each eyebrow used to carry its own
 * pictogram — a tag on pricing, a gift on the free month, sparkles on the hero —
 * and together they read as decoration competing with the headline underneath
 * rather than as one repeated typographic mark. The slash is the same shape on
 * every section, which is what makes it read as a system.
 *
 * `aria-hidden`, because it is punctuation standing in for a rule, and a screen
 * reader announcing "slash" before every section title is noise.
 */
export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-[7px] text-[13px] font-medium text-blue",
        className,
      )}
    >
      <span aria-hidden>/</span>
      {children}
    </span>
  );
}
