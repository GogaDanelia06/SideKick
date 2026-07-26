"use client";

import clsx from "clsx";
import { IconBolt, IconX } from "@tabler/icons-react";
import { NavList } from "./NavList";
import { ProfileMenu } from "./ProfileMenu";
import type { Account } from "@/lib/dashboard/queries";

export function MobileDrawer({ open, onClose, account }: { open: boolean; onClose: () => void; account: Account }) {
  return (
    <div className={clsx("lg:hidden", !open && "pointer-events-none")}>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 cursor-default bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[80vw] flex-col border-r border-border bg-surface transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[60px] items-center gap-2.5 border-b border-border2 px-[18px] text-base font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-white">
            <IconBolt size={16} />
          </span>
          Sidekick
          <button type="button" onClick={onClose} aria-label="Close menu" className="ml-auto text-muted">
            <IconX size={20} />
          </button>
        </div>
        <NavList onNavigate={onClose} />
        <ProfileMenu account={account} />
      </aside>
    </div>
  );
}
