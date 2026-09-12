import clsx from "clsx";
import { Wordmark } from "@/components/ui/Wordmark";
import { NavList } from "./NavList";
import { ProfileMenu } from "./ProfileMenu";
import type { Account } from "@/lib/dashboard/queries";

export function Sidebar({ className, account }: { className?: string; account: Account }) {
  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen w-[250px] shrink-0 flex-col border-r border-border bg-surface",
        className,
      )}
    >
      <div className="flex h-[60px] items-center gap-2.5 border-b border-border2 px-[18px] text-base font-semibold">
        <Wordmark className="h-[28px]" tagline />
        <span className="ml-auto rounded-full border border-border bg-soft px-2 py-0.5 text-[11px] font-medium text-muted">
          Admin
        </span>
      </div>
      <NavList />
      <ProfileMenu account={account} />
    </aside>
  );
}
