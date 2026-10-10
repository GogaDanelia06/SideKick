"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@prisma/client";
import { updatePlan } from "@/lib/admin/actions/plans";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PlanCard } from "./PlanCard";
import { ERRORS } from "./planForm";

export function PlansEditor({ plans }: { plans: Plan[] }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save(id: string, fd: FormData) {
    setError(null);
    setSavedId(null);
    start(async () => {
      const res = await updatePlan(id, fd);
      if (!res.ok) setError(res.error);
      else {
        setSavedId(id);
        setTimeout(() => setSavedId((v) => (v === id ? null : v)), 2500);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <ErrorBanner>{t(ERRORS[error] ?? "admin.plans.editor.somethingWentWrong")}</ErrorBanner> : null}

      {plans.map((p) => (
        <PlanCard key={p.id} plan={p} saved={savedId === p.id} pending={pending} onSave={(fd) => save(p.id, fd)} />
      ))}
    </div>
  );
}
