"use client";

import type { PaymentProvider } from "@prisma/client";
import { IconExternalLink } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

export const BANKS: Record<PaymentProvider, Bilingual> = {
  BOG: { ka: "საქართველოს ბანკი", en: "Bank of Georgia" },
  TBC: { ka: "TBC ბანკი", en: "TBC Bank" },
};

const ERRORS: Record<string, Bilingual> = {
  unauthorized: { ka: "სესია ამოიწურა — შედით ხელახლა", en: "Your session has ended — sign in again" },
  forbidden: { ka: "მხოლოდ მფლობელს შეუძლია პაკეტის შეცვლა", en: "Only the owner can change the plan" },
  bad_period: { ka: "აირჩიეთ პერიოდი", en: "Pick a period" },
  unknown_provider: { ka: "აირჩიეთ ბანკი", en: "Pick a bank" },
  provider_unavailable: { ka: "ეს ბანკი ჯერ არ არის ჩართული", en: "That bank is not enabled yet" },
  unknown_plan: { ka: "ეს პაკეტი ვერ მოიძებნა", en: "That plan could not be found" },
  payments_enabled: {
    ka: "გადახდა ჩართულია — პაკეტი ბანკის გავლით შეცვალეთ",
    en: "Payments are on — change the plan through the bank",
  },
  checkout_failed: {
    ka: "ბანკთან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა ან აირჩიეთ სხვა ბანკი.",
    en: "Could not reach the bank. Try again or pick the other one.",
  },
};

const FAILED: Bilingual = { ka: "ვერ შესრულდა", en: "Something went wrong" };

/** What to tell the owner when a plan change is refused. */
export function checkoutError(code: string): Bilingual {
  return Object.hasOwn(ERRORS, code) ? ERRORS[code] : FAILED;
}

export function CurrentPlanBadge() {
  const { t } = useLanguage();
  return (
    <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] text-muted">
      {t({ ka: "მიმდინარე", en: "Current" })}
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
        {t({ ka: "გადახდა ბანკის გვერდზე:", en: "Pay on the bank's page:" })}
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
        {t({
          ka: "ბარათის მონაცემები ბანკის გვერდზე შეიყვანება — ჩვენთან არ ინახება.",
          en: "Card details are entered on the bank's page — we never store them.",
        })}
      </p>
    </div>
  );
}
