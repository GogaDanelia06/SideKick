"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { IconBolt, IconExternalLink, IconLogout, IconMenu2 } from "@tabler/icons-react";
import { AdminNav } from "./AdminNav";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DASH } from "@/lib/dashboard/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const { t } = useLanguage();
  const [drawer, setDrawer] = useState(false);

  const brand = (
    <div className="flex h-[60px] items-center gap-2.5 border-b border-border2 px-[18px] text-base font-semibold">
      <span className="grid size-7 place-items-center rounded-lg bg-ink text-canvas">
        <IconBolt size={16} />
      </span>
      Sidekick
      <span className="ml-auto rounded-full border border-ink/30 bg-soft px-2 py-0.5 text-[11px] font-semibold text-ink">
        {t({ ka: "ადმინი", en: "Admin" })}
      </span>
    </div>
  );

  const footer = (
    <div className="border-t border-border2 p-3">
      <div className="mb-2 px-1.5 text-[11px] text-muted">{email}</div>
      <Link
        href={DASH.home}
        className="mb-0.5 flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] text-ink hover:bg-soft"
      >
        <IconExternalLink size={16} /> {t({ ka: "დაშბორდზე დაბრუნება", en: "Back to dashboard" })}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] text-ink hover:bg-soft"
      >
        <IconLogout size={16} /> {t({ ka: "გასვლა", en: "Sign out" })}
      </button>
    </div>
  );

  return (
    <div className="dash-scope flex min-h-screen bg-canvas text-ink">
      <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-border bg-surface lg:flex">
        {brand}
        <AdminNav />
        {footer}
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-border bg-surface">
            {brand}
            <AdminNav onNavigate={() => setDrawer(false)} />
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[56px] items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Menu">
            <IconMenu2 size={22} />
          </button>
          <span className="font-semibold">Sidekick</span>
          <span className="rounded-full border border-ink/30 bg-soft px-2 py-0.5 text-[11px] font-semibold">
            {t({ ka: "ადმინი", en: "Admin" })}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Full width, like the tenant dashboard — the section rail sits right
            beside the sidebar instead of floating in the middle of the screen.
            Individual screens constrain their own reading width where it helps. */}
        <main className="w-full flex-1 px-5 py-7 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
