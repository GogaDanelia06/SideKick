"use client";

import { IconLoader2, IconPlus } from "@tabler/icons-react";
import type { OtherAccount } from "@/lib/auth/accountVault";
import { MAX_OTHER_ACCOUNTS } from "@/lib/auth/sessionCookie";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AccountRow } from "./AccountRow";
import { useAccountList } from "./useAccountList";
import type { Text } from "@/lib/i18n/messages";
import { phrase } from "@/lib/i18n/messages";

export const ACCOUNT_ERRORS: Record<string, Text> = {
  gone: "auth.accountSwitcher.thatAccountSSession",
  full: phrase("auth.accountSwitcher.atMostAccounts", { max: MAX_OTHER_ACCOUNTS + 1 }),
  signed_out: "auth.accountSwitcher.yourSessionHasEnded",
  failed: "auth.accountSwitcher.somethingWentWrongTry",
};

/**
 * The other accounts signed in on this browser, as in Gmail's account menu: one click
 * to switch (a full load, as another person means other data everywhere), × to sign
 * one out, and "Add another account" through the login page.
 */
export function AccountSwitcher({ others }: { others: OtherAccount[] }) {
  const { t } = useLanguage();
  const list = useAccountList(others, { back: () => window.location.pathname, parkFirst: true });

  return (
    <div className="mb-1 border-b border-border2 pb-1">
      {list.shown.map((account) => (
        <AccountRow
          key={account.uid}
          account={account}
          busy={list.busy === account.uid || list.busy === account.email}
          disabled={list.busy !== null}
          onOpen={() => list.open(account)}
          onRemove={() => list.remove(account)}
        />
      ))}
      {list.shown.length < MAX_OTHER_ACCOUNTS ? (
        <button
          type="button"
          onClick={list.add}
          disabled={list.busy !== null}
          className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] hover:bg-soft disabled:cursor-wait"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-surface text-blue">
            {list.busy === "add" ? <IconLoader2 size={15} className="animate-spin" /> : <IconPlus size={15} />}
          </span>
          {t("auth.accountSwitcher.addAnotherAccount")}
        </button>
      ) : null}
      {list.error ? (
        <p role="alert" className="px-2.5 py-1 text-[12px] text-red">
          {t(ACCOUNT_ERRORS[list.error] ?? ACCOUNT_ERRORS.failed)}
        </p>
      ) : null}
    </div>
  );
}
