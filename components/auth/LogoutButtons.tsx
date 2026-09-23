"use client";

import { useState } from "react";
import { IconLoader2, IconLogout } from "@tabler/icons-react";
import { accountsRequest, landingAfterSwitch, logOutLabel, loginUrl } from "@/lib/auth/accountsClient";
import { logOut } from "@/lib/auth/logOut";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ROW = "flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-left text-[13px] text-red hover:bg-red-surface disabled:opacity-60";

/**
 * The account menu's way out. With other accounts on this browser there are two: this
 * one only, which opens the next account (or the login page), and all of them.
 */
export function LogoutButtons({ others }: { others: number }) {
  const { t } = useLanguage();
  const [leaving, setLeaving] = useState(false);

  async function leaveThisOne() {
    setLeaving(true);
    const reply = await accountsRequest("leave");
    const next = reply.ok ? reply.next : null;
    // Another person, or nobody: either way a full load.
    window.location.assign(next ? landingAfterSwitch(next, window.location.pathname) : loginUrl(window.location.pathname));
  }

  return (
    <>
      {others > 0 ? (
        <button type="button" onClick={leaveThisOne} disabled={leaving} className={ROW}>
          {leaving ? <IconLoader2 size={17} className="animate-spin" /> : <IconLogout size={17} />}
          {t("auth.logoutButtons.logOutOfThis")}
        </button>
      ) : null}
      <button type="button" onClick={logOut} disabled={leaving} className={ROW}>
        <IconLogout size={17} /> {t(logOutLabel(others))}
      </button>
    </>
  );
}
