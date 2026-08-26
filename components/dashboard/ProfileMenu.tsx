"use client";

import { useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import Link from "next/link";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  IconExternalLink,
  IconHome,
  IconLanguage,
  IconLogout,
  IconSelector,
  IconShieldLock,
  IconUserCircle,
} from "@tabler/icons-react";
import { Switch } from "./ui/Switch";
import type { Account } from "@/lib/dashboard/queries";
import { ADMIN } from "@/lib/admin/routes";
import { DASH } from "@/lib/dashboard/routes";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useTheme } from "@/lib/theme/useTheme";

export function ProfileMenu({ account }: { account: Account }) {
  const { t, locale, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative border-t border-border2 p-3">
      {open ? (
        <div className="absolute inset-x-3 bottom-[calc(100%-4px)] z-40 rounded-[10px] border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
          <div className="mb-1 border-b border-border2 px-2.5 pb-2 pt-1">
            <div className="text-[13px] font-semibold">{account.name}</div>
            <div className="text-[11px] text-muted">{account.email}</div>
          </div>
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
          {/* The way back out. The dashboard has no other link to the public
              site — once you are inside it, the only exit was the browser's own
              back button or typing the address. The admin panel already offered
              its own way home; this is the same door for tenants. */}
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
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-left text-[13px] text-red hover:bg-red-surface"
          >
            <IconLogout size={17} /> {t({ ka: "გასვლა", en: "Log out" })}
          </button>
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
          <span className="block text-[11px] text-muted">
            {account.planName
              ? `${account.planName} ${t({ ka: "პაკეტი", en: "plan" })}`
              : t({ ka: "პაკეტი არ არის", en: "No plan" })}
          </span>
        </span>
        <IconSelector size={18} className="text-muted" />
      </button>
    </div>
  );
}
