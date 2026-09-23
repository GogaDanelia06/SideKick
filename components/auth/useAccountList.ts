"use client";

import { useState } from "react";
import type { OtherAccount } from "@/lib/auth/accountVault";
import { accountsRequest, landingAfterSwitch, loginUrl } from "@/lib/auth/accountsClient";
import { flushAutosave } from "@/lib/dashboard/autosave/flush";

/**
 * The account list's behaviour, shared by the menu and the login page. `back` is where
 * to return to; `parkFirst` sets the open account aside before going to the login page,
 * as the menu must (an open session is replaced by the next sign-in, and would be lost).
 */
export function useAccountList(accounts: OtherAccount[], { back, parkFirst }: { back: () => string; parkFirst: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Hidden at once; the server forgets them in the same moment.
  const [removed, setRemoved] = useState<string[]>([]);

  async function run(key: string, work: () => Promise<string | null>) {
    if (busy) return;
    setBusy(key);
    setError(null);
    // Unsaved AI settings belong to the account being left.
    await flushAutosave();
    const failure = await work();
    if (failure === null) return;
    setBusy(null);
    setError(failure);
  }

  /** To the login page, for a new account or one whose session ended. */
  const toLogin = (email?: string) =>
    run(email ?? "add", async () => {
      if (parkFirst) {
        const reply = await accountsRequest("add");
        if (!reply.ok) return reply.error;
      }
      window.location.assign(loginUrl(back(), email));
      return null;
    });

  const open = (account: OtherAccount) =>
    account.expired
      ? toLogin(account.email)
      : run(account.uid, async () => {
          const reply = await accountsRequest("switch", account.uid);
          if (!reply.ok) return reply.error;
          window.location.assign(landingAfterSwitch(reply, back()));
          return null;
        });

  async function remove(account: OtherAccount) {
    if (busy) return;
    setRemoved((ids) => [...ids, account.uid]);
    const reply = await accountsRequest("remove", account.uid);
    if (reply.ok) return;
    setRemoved((ids) => ids.filter((id) => id !== account.uid));
    setError(reply.error);
  }

  return { shown: accounts.filter((a) => !removed.includes(a.uid)), busy, error, open, remove, add: () => toLogin() };
}
