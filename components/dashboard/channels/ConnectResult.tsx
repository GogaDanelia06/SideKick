"use client";

import { useSearchParams } from "next/navigation";
import type { ChannelType } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { RESULTS } from "./connectResults";

export function ConnectResult({ type }: { type: ChannelType }) {
  const { t } = useLanguage();
  const params = useSearchParams();
  const result = RESULTS[params.get("connect") ?? ""];
  if (!result || params.get("channel") !== type) return null;

  return (
    <p className={`w-full text-[13px] ${result.tone === "ok" ? "text-green" : "text-red"}`}>{t(result.text)}</p>
  );
}
