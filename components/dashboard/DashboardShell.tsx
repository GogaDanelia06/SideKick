"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DASH } from "@/lib/dashboard/routes";
import { lockedOut } from "./ActivatePlan";
import { Sidebar } from "./Sidebar";
import type { Account } from "@/lib/dashboard/queries/account";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { ToastProvider } from "./ui/Toast";

export function DashboardShell({ children, account }: { children: ReactNode; account: Account }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const locked = lockedOut(account.activated, usePathname() ?? "");

  useEffect(() => {
    if (locked) router.replace(DASH.billing);
  }, [locked, router]);

  return (
    <div className="dash-scope flex min-h-screen bg-canvas text-ink">
      <ToastProvider>
        <Sidebar className="hidden lg:flex" account={account} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setDrawerOpen(true)} />
          <main key={account.businessId} className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
            {locked ? null : children}
          </main>
        </div>
        <BottomNav className="lg:hidden" locked={!account.activated} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} account={account} />
      </ToastProvider>
    </div>
  );
}
