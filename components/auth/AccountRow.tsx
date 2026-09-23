"use client";

import { IconLoader2, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import type { OtherAccount } from "@/lib/auth/accountVault";
import { initialOf } from "@/lib/i18n/initial";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = { account: OtherAccount; busy: boolean; disabled: boolean; onOpen: () => void; onRemove: () => void; large?: boolean };

/** One account signed in on this browser, as in Gmail's account list: open it, or sign it out with ×. */
export function AccountRow({ account, busy, disabled, onOpen, onRemove, large = false }: Props) {
  const { t } = useLanguage();

  return (
    <div className="group flex items-center rounded-[8px] hover:bg-soft">
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className={clsx("flex min-w-0 flex-1 items-center text-left disabled:cursor-wait", large ? "gap-3 px-2 py-2" : "gap-2.5 px-2.5 py-2")}
      >
        <span
          className={clsx(
            "grid shrink-0 place-items-center rounded-full font-semibold text-white",
            large ? "size-8 text-[13px]" : "size-7 text-[12px]",
            account.expired ? "bg-faint" : "bg-primary",
          )}
        >
          {initialOf(account.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className={clsx("truncate font-medium", large ? "text-sm" : "text-[13px]")}>{account.name}</span>
            {account.expired ? (
              <span className="shrink-0 rounded-full bg-soft px-1.5 py-px text-[10px] font-medium text-muted ring-1 ring-border">
                {t("auth.accountRow.sessionExpired")}
              </span>
            ) : null}
          </span>
          <span className={clsx("block truncate text-muted", large ? "text-xs" : "text-[11px]")}>{account.email}</span>
        </span>
        {busy ? <IconLoader2 size={16} className="shrink-0 animate-spin text-muted" /> : null}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`${t("auth.accountRow.logOutOfThis")}: ${account.email}`}
        title={t("auth.accountRow.logOutOfThis")}
        className="mr-1 grid size-7 shrink-0 place-items-center rounded-[6px] text-faint hover:bg-red-surface hover:text-red"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}
