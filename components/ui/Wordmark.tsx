import clsx from "clsx";
import { TAGLINE_PATHS, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/lib/content/wordmark";

/** Inline SVG wordmark in `currentColor`. The tagline is off by default: it is unreadable below ~40px. */
export function Wordmark({
  className,
  tagline = false,
  title = "Sidekick",
}: {
  className?: string;
  tagline?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox={tagline ? "34 38 277 92" : WORDMARK_VIEWBOX}
      role="img"
      aria-label={title}
      // Width only; the caller sets the height.
      className={clsx("w-auto", className)}
      fill="currentColor"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}

      {tagline
        ? TAGLINE_PATHS.map((d, i) => <path key={`tagline-${i}`} d={d} />)
        : null}
    </svg>
  );
}
