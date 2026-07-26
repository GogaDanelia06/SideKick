"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { Account } from "@/lib/dashboard/queries";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";

export function DashboardShell({ children, account }: { children: ReactNode; account: Account }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="dash-scope flex min-h-screen bg-canvas text-ink">
      <Sidebar className="hidden lg:flex" account={account} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
      </div>
      <BottomNav className="lg:hidden" />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} account={account} />
    </div>
  );
}
