"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/Toast";

/**
 * After a business was opened, added or deleted: close the menu, say what happened and
 * refetch the page in place — no page load. The session cookie already names the new
 * business, and DashboardShell keys the page by business, so nothing of the old one stays.
 */
export function useBusinessChange(onDone?: () => void) {
  const router = useRouter();
  const notify = useToast();
  const [refreshing, startTransition] = useTransition();

  /** `keepOpen` leaves the menu as it is, e.g. after a delete, so the owner sees the new list. */
  function settled(message: string, { keepOpen = false }: { keepOpen?: boolean } = {}) {
    if (!keepOpen) onDone?.();
    notify(message);
    startTransition(() => router.refresh());
  }

  return { settled, refreshing };
}
