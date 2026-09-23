"use client";

import type { ElementType } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export function BiText({
  value,
  as: As = "span",
  className,
}: {
  value: Text;
  as?: ElementType;
  className?: string;
}) {
  const { t } = useLanguage();
  return <As className={className}>{t(value)}</As>;
}
