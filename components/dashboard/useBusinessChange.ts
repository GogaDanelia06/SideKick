"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/Toast";

export function useBusinessChange(onDone?: () => void) {
  const router = useRouter();
  const notify = useToast();
  const [refreshing, startTransition] = useTransition();

  function settled(message: string, { keepOpen = false }: { keepOpen?: boolean } = {}) {
    if (!keepOpen) onDone?.();
    notify(message);
    startTransition(() => router.refresh());
  }

  return { settled, refreshing };
}
