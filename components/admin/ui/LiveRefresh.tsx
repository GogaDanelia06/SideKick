"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/useLanguage";

const REFRESH_MS = 30_000;

/** Refreshes a server-rendered admin screen every REFRESH_MS while the tab is visible. */
export function LiveRefresh() {
  const router = useRouter();
  const { t } = useLanguage();
  const [at, setAt] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border2 bg-card px-3 py-1 text-[12px] text-muted">
      <span className="relative grid size-[7px] place-items-center">
        <span className="absolute size-full animate-ping rounded-full bg-green opacity-75" />
        <span className="size-full rounded-full bg-green" />
      </span>
      {at
        ? t({ ka: `განახლდა ${at}`, en: `Updated ${at}` })
        : t({ ka: "ლაივ — თვითონ განახლდება", en: "Live — refreshes itself" })}
    </span>
  );
}
