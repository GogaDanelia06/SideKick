import Link from "next/link";
import clsx from "clsx";
import { ROUTES } from "@/lib/routes";
import { Wordmark } from "./Wordmark";

/**
 * The logo as a link home.
 *
 * Sized by height so the mark keeps its proportions — giving it a width would
 * let it set its own height and shift the row it sits in.
 *
 * 34px rather than the 22px the wordmark alone needed: with the tagline the
 * drawing is 92 units deep against 55, so holding the old height would have
 * shrunk the letters by a third to make room for a line that would then be too
 * small to read. Taller keeps SIDEKICK the size it was.
 */
export function Logo({ className, tagline = true }: { className?: string; tagline?: boolean }) {
  return (
    <Link href={ROUTES.home} className={clsx("inline-flex items-center", className)}>
      <Wordmark tagline={tagline} className={tagline ? "h-[34px]" : "h-[22px]"} />
    </Link>
  );
}
