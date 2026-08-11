import clsx from "clsx";
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/lib/content/wordmark";

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

      {/* Set in the page's own font. The drawing asks for Atkinson Hyperlegible,
          which nobody has installed, so honouring it would mean shipping a font
          file for eleven characters. Inter is already loaded and the line is
          small enough that the difference does not read. */}
      {tagline ? (
        <text
          x="311"
          y="118"
          textAnchor="end"
          fontSize="18"
          fontWeight="500"
          fontFamily="var(--font-inter), system-ui, sans-serif"
        >
          ai_assistant
        </text>
      ) : null}
    </svg>
  );
}
