"use client";

import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { Wordmark } from "@/components/ui/Wordmark";
import { AdminNav } from "./AdminNav";
import { AdminProfileMenu } from "./AdminProfileMenu";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function AdminShell({
  name,
  email,
  children,
}: {
  name: string;
  email: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [drawer, setDrawer] = useState(false);

  const brand = (
    <div className="flex h-[60px] items-center gap-2.5 border-b border-border2 px-[18px] text-base font-semibold">
      <Wordmark className="h-[28px]" tagline />
      <span className="ml-auto rounded-full border border-ink/30 bg-soft px-2 py-0.5 text-[11px] font-semibold text-ink">
        {t({ ka: "ადმინი", en: "Admin" })}
      </span>
    </div>
  );

  const footer = <AdminProfileMenu name={name} email={email} />;

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
        </div>

        <main className="w-full flex-1 px-5 py-7 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
