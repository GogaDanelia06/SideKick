"use client";

import { useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import Link from "next/link";
import { AccountSwitcher } from "@/components/auth/AccountSwitcher";
import { CurrentAccount } from "@/components/auth/CurrentAccount";
import { LogoutButtons } from "@/components/auth/LogoutButtons";
import clsx from "clsx";
import {
  IconExternalLink,
  IconHome,
  IconLanguage,
  IconSelector,
  IconShieldLock,
  IconUserCircle,
} from "@tabler/icons-react";
import { Switch } from "./ui/Switch";
import { BusinessSwitcher } from "./BusinessSwitcher";
import type { Account } from "@/lib/dashboard/queries/account";
import { ADMIN } from "@/lib/admin/routes";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useTheme } from "@/lib/theme/useTheme";

/** `onNavigate` closes what holds the menu, such as the mobile drawer. */
export function ProfileMenu({ account, onNavigate }: { account: Account; onNavigate?: () => void }) {
  const { t, locale, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const business = account.businesses.find((b) => b.id === account.businessId);

  return (
    <div ref={ref} className="relative border-t border-border2 p-3">
      {open ? (
        <div className="absolute inset-x-3 bottom-[calc(100%-4px)] z-40 max-h-[calc(100dvh-80px)] overflow-y-auto rounded-[10px] border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
          <CurrentAccount name={account.name} email={account.email} />
          <AccountSwitcher others={account.otherAccounts} />
          <BusinessSwitcher
            account={account}
            onDone={() => {
              setOpen(false);
              onNavigate?.();
            }}
          />
          <Link href={DASH.profile} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-[13px] hover:bg-soft">
            <IconUserCircle size={17} /> {t({ ka: "პროფილი", en: "Profile" })}
          </Link>
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[13px]">
            <IconLanguage size={17} />
            <span className="flex-1">{t({ ka: "ენა", en: "Language" })}</span>
            <button type="button" onClick={toggleLang} className="rounded-full border border-border bg-soft px-2.5 py-1 text-[12px] font-semibold">
              {locale === "ka" ? "ქართული" : "English"}
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[13px]">
            <span className="flex-1">{theme === "dark" ? t({ ka: "მუქი თემა", en: "Dark theme" }) : t({ ka: "ღია თემა", en: "Light theme" })}</span>
            <Switch on={theme === "dark"} onToggle={toggleTheme} ariaLabel="Theme" />
          </div>
          <Link
            href={ROUTES.home}
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 border-t border-border2 px-2.5 pb-2.5 pt-3 text-[13px] hover:bg-soft"
          >
            <IconHome size={17} />
            <span className="flex-1">{t({ ka: "საიტზე გადასვლა", en: "Go to the site" })}</span>
            <IconExternalLink size={14} className="text-faint" />
          </Link>

          {account.isAdmin ? (
            <Link
              href={ADMIN.home}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-[13px] hover:bg-soft"
            >
              <IconShieldLock size={17} />
              <span className="flex-1">{t({ ka: "ადმინ პანელი", en: "Admin panel" })}</span>
              <IconExternalLink size={14} className="text-faint" />
            </Link>
          ) : null}
          <LogoutButtons others={account.otherAccounts.length} />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx("flex w-full items-center gap-2.5 rounded-[10px] border bg-soft p-2 text-left", open ? "border-border" : "border-transparent")}
      >
        <span className="grid size-[34px] place-items-center rounded-full bg-primary text-sm font-semibold text-white">{account.initial}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{account.name}</span>
          <span className="block truncate text-[11px] text-muted">
            {/* With several businesses, which one is open matters more than its plan. */}
            {account.businesses.length > 1 && business
              ? business.name
              : account.planName
                ? `${t(account.planName)} ${t({ ka: "პაკეტი", en: "plan" })}`
                : t({ ka: "პაკეტი არ არის", en: "No plan" })}
          </span>
        </span>
        <IconSelector size={18} className="text-muted" />
      </button>
    </div>
  );
}
