"use client";

import type { PaymentProvider } from "@prisma/client";
import { IconExternalLink } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export const BANKS: Record<PaymentProvider, Text> = {
  BOG: "dashboard.billing.checkoutParts.bankOfGeorgia",
  TBC: "dashboard.billing.checkoutParts.tbcBank",
};

const ERRORS: Record<string, Text> = {
  unauthorized: "dashboard.billing.checkoutParts.yourSessionHasEnded",
  forbidden: "dashboard.billing.checkoutParts.onlyTheOwnerCan",
  bad_period: "dashboard.billing.checkoutParts.pickAPeriod",
  unknown_provider: "dashboard.billing.checkoutParts.pickABank",
  provider_unavailable: "dashboard.billing.checkoutParts.thatBankIsNot",
  unknown_plan: "dashboard.billing.checkoutParts.thatPlanCouldNot",
  payments_enabled: "dashboard.billing.checkoutParts.paymentsAreOnChange",
  checkout_failed: "dashboard.billing.checkoutParts.couldNotReachThe",
};

const FAILED: Text = "dashboard.billing.checkoutParts.somethingWentWrong";

/** What to tell the owner when a plan change is refused. */
export function checkoutError(code: string): Text {
  return Object.hasOwn(ERRORS, code) ? ERRORS[code] : FAILED;
}

export function CurrentPlanBadge() {
  const { t } = useLanguage();
  return (
    <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
      {t("dashboard.billing.checkoutParts.current")}
    </span>
  );
}

/** The bank buttons for a chosen plan; card details are only ever typed on the bank's page. */
export function BankChoice({
  providers,
  pending,
  onPay,
}: {
  providers: PaymentProvider[];
  pending: boolean;
  onPay: (bank: PaymentProvider) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2 rounded-[8px] border border-border bg-soft p-3">
      <div className="text-[12px] text-muted">
        {t("dashboard.billing.checkoutParts.payOnTheBank")}
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map((bank) => (
          <button
            key={bank}
            type="button"
            disabled={pending}
            onClick={() => onPay(bank)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
          >
            {pending ? "…" : <IconExternalLink size={15} />}
            {t(BANKS[bank])}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-faint">
        {t("dashboard.billing.checkoutParts.cardDetailsAreEntered")}
      </p>
    </div>
  );
}
