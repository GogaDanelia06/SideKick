"use client";

import { useTransition } from "react";
import { cancelSubscription } from "@/lib/dashboard/actions/billing";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function CancelButton({ disabled, cancelled }: { disabled: boolean; cancelled: boolean }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() => start(async () => { await cancelSubscription(); })}
      className="h-11 rounded-[10px] border border-red text-sm font-medium text-red hover:bg-red-surface disabled:cursor-not-allowed disabled:opacity-50"
    >
      {cancelled ? t("dashboard.billing.view.subscriptionCancelled") : t("dashboard.billing.view.cancelSubscription")}
    </button>
  );
}
