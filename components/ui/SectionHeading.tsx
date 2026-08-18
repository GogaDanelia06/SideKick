"use client";

import clsx from "clsx";
import { Badge } from "./Badge";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

type Props = {
  /** Omit for a section that reads better as a plain heading. */
  badge?: Bilingual | string;
  title: Bilingual;
  sub?: Bilingual;
  align?: "center" | "left";
  size?: "lg" | "xl";
  as?: "h1" | "h2";
};

export function SectionHeading({
  badge,
  title,
  sub,
  align = "center",
  size = "lg",
  as = "h2",
}: Props) {
  const { t } = useLanguage();
  const Heading = as;
  const badgeText = badge === undefined ? null : typeof badge === "string" ? badge : t(badge);

  return (
    <div className={clsx(align === "center" && "text-center")}>
      {badgeText === null ? null : <Badge>{badgeText}</Badge>}
      <Heading
        className={clsx(
          // The gap only exists to clear the badge, so without one it would be
          // an unexplained space above the first thing on the section.
          badgeText === null ? null : "mt-3",
          "font-semibold tracking-tight",
          size === "xl"
            ? "text-[30px] leading-tight sm:text-[40px] sm:leading-[1.15]"
            : "text-2xl leading-snug sm:text-3xl",
        )}
      >
        {t(title)}
      </Heading>
      {/* The same step as the badge above the title, so the three lines read as
          evenly spaced rather than as a title with something crowded under it. */}
      {sub ? <p className="mt-3 text-base text-muted">{t(sub)}</p> : null}
    </div>
  );
}
