"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { ERROR_PAGE } from "@/lib/content/errorPage";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error("[dashboard-error]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <Panel className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-full border border-amber bg-amber-surface text-amber">
        <IconAlertTriangle size={22} />
      </span>

      <h2 className="text-[17px] font-semibold">{t(ERROR_PAGE.title)}</h2>
      <p className="max-w-[420px] text-[13px] text-muted">{t(ERROR_PAGE.text)}</p>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white"
        >
          <IconRefresh size={16} />
          {t(ERROR_PAGE.retry)}
        </button>
        <Link
          href={DASH.home}
          className="inline-flex h-9 items-center rounded-[8px] border border-border px-4 text-[13px] font-medium"
        >
          {t({ ka: "მთავარზე", en: "Overview" })}
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-2 text-[11px] text-faint">
          {t(ERROR_PAGE.idLabel)}: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
    </Panel>
  );
}
