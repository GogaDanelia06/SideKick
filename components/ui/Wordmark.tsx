import clsx from "clsx";
import { TAGLINE_PATHS, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/lib/content/wordmark";

/**
 * The SIDEKICK logo, drawn inline so it takes its colour from the text around
 * it. One mark serves the light and dark themes instead of two files swapped by
 * a theme check that would flicker on first paint.
 *
 * `tagline` is off by default. Below roughly 40px tall the "ai_assistant" line
 * is a smudge rather than words — it belongs on a login screen or a share
 * image, not in a 22px header.
 */
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
      // Width only, so the caller sets the height and the aspect ratio does the
      // rest. Carrying a default height here would collide with theirs, and
      // which of two Tailwind height classes wins is decided by stylesheet
      // order rather than by the order they are written in.
      className={clsx("w-auto", className)}
      fill="currentColor"
    >
      {WORDMARK_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}

      {/* Outlined in the source drawing, so this is the designer's lettering
          rather than a near-enough substitute set in a font we happen to load —
          and it needs no font at all to render correctly. */}
      {tagline
        ? TAGLINE_PATHS.map((d, i) => <path key={`tagline-${i}`} d={d} />)
        : null}
    </svg>
  );
}
