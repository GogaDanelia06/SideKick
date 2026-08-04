"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  IconExternalLink,
  IconLanguage,
  IconLayoutDashboard,
  IconLogout,
  IconSelector,
} from "@tabler/icons-react";
import { Switch } from "@/components/dashboard/ui/Switch";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { useTheme } from "@/lib/theme/useTheme";

/**
 * The account menu at the bottom of the admin sidebar.
 *
 * Deliberately the same shape as the tenant dashboard's — same trigger, same
 * popover, same language and theme rows in the same order. Someone who
 * administers the platform also uses the dashboard, and two different places to
 * change the theme in one product is one too many to remember.
 *
 * The menu opens upward because it lives at the bottom of the column; anything
 * dropping down would land off-screen.
 */
export function AdminProfileMenu({ name, email }: { name: string; email: string }) {
  const { t, locale, toggle: toggleLang } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative border-t border-border2 p-3">
      {open ? (
        <>
          {/* Clicking anywhere else closes it, which is what people expect from
              a menu and what stops it lingering behind a navigation. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute inset-x-3 bottom-[calc(100%-4px)] z-40 rounded-[10px] border border-border bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
            <div className="mb-1 border-b border-border2 px-2.5 pb-2 pt-1">
              <div className="truncate text-[13px] font-semibold">{name}</div>
              <div className="truncate text-[11px] text-muted">{email}</div>
            </div>

            <div className="flex items-center gap-2.5 px-2.5 py-2.5 text-[13px]">
              <IconLanguage size={17} />
              <span className="flex-1">{t({ ka: "ენა", en: "Language" })}</span>
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
                  ? t({ ka: "მუქი თემა", en: "Dark theme" })
                  : t({ ka: "ღია თემა", en: "Light theme" })}
              </span>
              <Switch on={theme === "dark"} onToggle={toggleTheme} ariaLabel="Theme" />
            </div>

            <Link
              href={DASH.home}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2.5 border-t border-border2 px-2.5 pb-2.5 pt-3 text-[13px] hover:bg-soft"
            >
              <IconLayoutDashboard size={17} />
              <span className="flex-1">{t({ ka: "დაშბორდი", en: "Dashboard" })}</span>
              <IconExternalLink size={14} className="text-faint" />
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-left text-[13px] text-red hover:bg-red-surface"
            >
              <IconLogout size={17} /> {t({ ka: "გასვლა", en: "Log out" })}
            </button>
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
            {t({ ka: "პლატფორმის ადმინი", en: "Platform admin" })}
          </span>
        </span>
        <IconSelector size={18} className="text-muted" />
      </button>
    </div>
  );
}
