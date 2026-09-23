"use client";

import { useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import Link from "next/link";
import type { OtherAccount } from "@/lib/auth/accountVault";
import { AccountSwitcher } from "@/components/auth/AccountSwitcher";
import { CurrentAccount } from "@/components/auth/CurrentAccount";
import { LogoutButtons } from "@/components/auth/LogoutButtons";
import clsx from "clsx";
import {
  IconExternalLink,
  IconLanguage,
  IconLayoutDashboard,
  IconSelector,
} from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useTheme } from "@/lib/theme/useTheme";

/** The same account menu as the tenant dashboard; opens upward from the bottom of the sidebar. */
type Props = { name: string; email: string; otherAccounts: OtherAccount[] };

export function AdminProfileMenu({ name, email, otherAccounts }: Props) {
  const { t, locale, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative border-t border-border2 p-3">
      {open ? (
        <>
          <div className="absolute inset-x-3 bottom-[calc(100%-4px)] z-40 rounded-[10px] border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
            <CurrentAccount name={name} email={email} />
            <AccountSwitcher others={otherAccounts} />

            <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[13px]">
              <IconLanguage size={17} />
              <span className="flex-1">{t("admin.profileMenu.language")}</span>
              <button
                type="button"
                onClick={toggleLang}
                className="rounded-full border border-border bg-soft px-2.5 py-1 text-[12px] font-semibold"
              >
                {locale === "ka" ? "ქართული" : "English"}
              </button>
            </div>

            <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[13px]">
              <span className="flex-1">
                {theme === "dark"
                  ? t("admin.profileMenu.darkTheme")
                  : t("admin.profileMenu.lightTheme")}
              </span>
              <Switch on={theme === "dark"} onToggle={toggleTheme} ariaLabel="Theme" />
            </div>

            <Link
              href={DASH.home}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2.5 border-t border-border2 px-2.5 pb-2.5 pt-3 text-[13px] hover:bg-soft"
            >
              <IconLayoutDashboard size={17} />
              <span className="flex-1">{t("admin.profileMenu.dashboard")}</span>
              <IconExternalLink size={14} className="text-faint" />
            </Link>

            <LogoutButtons others={otherAccounts.length} />
          </div>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "relative z-40 flex w-full items-center gap-2.5 rounded-[10px] border bg-soft p-2 text-left",
          open ? "border-border" : "border-transparent",
        )}
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{name}</span>
          <span className="block text-[11px] text-muted">
            {t("admin.profileMenu.platformAdmin")}
          </span>
        </span>
        <IconSelector size={18} className="text-muted" />
      </button>
    </div>
  );
}
