"use client";

import type { ElementType } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export function BiText({
  value,
  as: As = "span",
  className,
}: {
  value: Bilingual;
  as?: ElementType;
  className?: string;
}) {
  const { t } = useLanguage();
  return <As className={className}>{t(value)}</As>;
}
