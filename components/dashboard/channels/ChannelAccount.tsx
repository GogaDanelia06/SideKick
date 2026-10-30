"use client";

import { Suspense, use } from "react";
import type { ChannelAccounts } from "@/lib/channels/channelAccounts";
import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { AccountCard } from "./AccountCard";

function Loaded({ accounts, id }: { accounts: Promise<ChannelAccounts>; id: string }) {
  const account = use(accounts)[id];
  if (account === undefined) return null;
  return <AccountCard account={account} />;
}

export function ChannelAccount({ accounts, id }: { accounts: Promise<ChannelAccounts>; id: string }) {
  return (
    <Suspense fallback={<Skeleton className="mt-2.5 h-12 w-56 max-w-full rounded-[10px]" />}>
      <Loaded accounts={accounts} id={id} />
    </Suspense>
  );
}
