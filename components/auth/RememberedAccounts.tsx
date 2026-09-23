"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import type { OtherAccount } from "@/lib/auth/accountVault";
import { safeCallbackUrl } from "@/lib/auth/callbackUrl";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AccountRow } from "./AccountRow";
import { ACCOUNT_ERRORS } from "./AccountSwitcher";
import { useAccountList } from "./useAccountList";

/**
 * Below the login form: the accounts on this browser. A live one opens with a click, an
 * expired one fills its email into the form above, and × forgets it here.
 */
export function RememberedAccounts({ accounts }: { accounts: OtherAccount[] }) {
  const { t } = useLanguage();
  const callbackUrl = safeCallbackUrl(useSearchParams().get("callbackUrl"));
  const list = useAccountList(accounts, { back: () => callbackUrl, parkFirst: false });
  if (list.shown.length === 0) return null;

  return (
    <Card className="w-full rounded-lg p-3">
      <p className="mb-1.5 px-2 text-[13px] text-muted">{t("auth.rememberedAccounts.accountsOnThisBrowser")}</p>
      {list.shown.map((account) => (
        <AccountRow
          key={account.uid}
          large
          account={account}
          busy={list.busy === account.uid || list.busy === account.email}
          disabled={list.busy !== null}
          onOpen={() => list.open(account)}
          onRemove={() => list.remove(account)}
        />
      ))}
      {list.error ? (
        <p role="alert" className="mt-1 px-2 text-[12px] text-red">
          {t(ACCOUNT_ERRORS[list.error] ?? ACCOUNT_ERRORS.failed)}
        </p>
      ) : null}
    </Card>
  );
}
