"use client";

import clsx from "clsx";
import { Badge } from "./Badge";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

type Props = {
  badge: Bilingual | string;
  badgeIcon?: IconType;
  title: Bilingual;
  sub?: Bilingual;
  align?: "center" | "left";
  size?: "lg" | "xl";
  as?: "h1" | "h2";
};

/** Eyebrow badge + heading (+ optional subtitle) used to open every section. */
export function SectionHeading({
  badge,
  badgeIcon,
  title,
  sub,
  align = "center",
  size = "lg",
  as = "h2",
}: Props) {
  const { t } = useLanguage();
  const Heading = as;
  const badgeText = typeof badge === "string" ? badge : t(badge);

  return (
    <div className={clsx(align === "center" && "text-center")}>
      <Badge icon={badgeIcon}>{badgeText}</Badge>
      <Heading
        className={clsx(
          "mt-3 font-semibold tracking-tight",
          size === "xl"
            ? "text-[30px] leading-tight sm:text-[40px] sm:leading-[1.15]"
            : "text-2xl leading-snug sm:text-3xl",
        )}
      >
        {t(title)}
      </Heading>
      {sub ? <p className="mt-2.5 text-base text-muted">{t(sub)}</p> : null}
    </div>
  );
}
