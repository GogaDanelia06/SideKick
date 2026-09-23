"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@prisma/client";
import { IconAlertTriangle, IconCheck, IconStarFilled } from "@tabler/icons-react";
import { updatePlan } from "@/lib/admin/actions/plans";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[12px] font-medium text-muted";

const ERRORS: Record<string, Text> = {
  name_required: "admin.plans.editor.nameIsRequired",
  bad_price: "admin.plans.editor.priceMustBeA",
  bad_cap: "admin.plans.editor.limitsMustBeNumbers",
};

function Num({ name, label, value }: { name: string; label: Text; value: number }) {
  const { t } = useLanguage();
  return (
    <label className="block">
      <span className={LABEL}>{t(label)}</span>
      <input name={name} type="number" defaultValue={value} className={INPUT} />
    </label>
  );
}

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
      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? "admin.plans.editor.somethingWentWrong")}
        </div>
      ) : null}

      {plans.map((p) => (
        <form
          key={p.id}
          action={(fd) => save(p.id, fd)}
          className="rounded-lg border border-border bg-card p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full border border-border bg-soft px-2.5 py-0.5 font-mono text-[12px] text-muted">
              {p.key}
            </span>
            {p.featured ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green">
                <IconStarFilled size={12} /> {t("admin.plans.editor.featured")}
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={LABEL}>{t("admin.plans.editor.nameKa")}</span>
              <input name="name" required defaultValue={p.name} className={INPUT} />
            </label>
            <label className="block">
              <span className={LABEL}>{t("admin.plans.editor.nameEn")}</span>
              <input name="nameEn" defaultValue={p.nameEn} className={INPUT} />
            </label>
            <Num name="price" label={"admin.plans.editor.priceMo"} value={p.price} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>{t("admin.plans.editor.price3Months")}</span>
              <input
                name="price3m"
                type="number"
                defaultValue={p.price3m ?? ""}
                placeholder={String(p.price * 3)}
                className={INPUT}
              />
            </label>
            <label className="block">
              <span className={LABEL}>{t("admin.plans.editor.price12Months")}</span>
              <input
                name="price12m"
                type="number"
                defaultValue={p.price12m ?? ""}
                placeholder={String(p.price * 12)}
                className={INPUT}
              />
            </label>
          </div>
          <p className="mt-1.5 text-[12px] text-faint">
            {t("admin.plans.editor.emptyNoDiscountMonthly")}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Num name="msgLimit" label={"admin.plans.editor.messages"} value={p.msgLimit} />
            <Num name="channelCap" label={"admin.plans.editor.channels"} value={p.channelCap} />
            <Num name="userCap" label={"admin.plans.editor.users"} value={p.userCap} />
            <Num name="productCap" label={"admin.plans.editor.products"} value={p.productCap} />
          </div>

          {/* Five free-form bullets, appended after the ones derived from caps. */}
          <div className="mt-4">
            <span className={LABEL}>
              {t("admin.plans.editor.extraFeatures5Slots")}
            </span>
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <input
                    name={`extraKa${i}`}
                    defaultValue={p.extrasKa[i] ?? ""}
                    placeholder={t("admin.plans.editor.extraGeorgian", { n: i + 1 })}
                    className={INPUT}
                  />
                  <input
                    name={`extraEn${i}`}
                    defaultValue={p.extrasEn[i] ?? ""}
                    placeholder={t("admin.plans.editor.extraEnglish", { n: i + 1 })}
                    className={INPUT}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-muted">
              <input type="checkbox" name="featured" defaultChecked={p.featured} className="accent-[var(--primary)]" />
              {t("admin.plans.editor.featuredPlan")}
            </label>
            <div className="flex items-center gap-3">
              {savedId === p.id ? (
                <span className="inline-flex items-center gap-1 text-[13px] text-green">
                  <IconCheck size={15} /> {t("admin.plans.editor.saved")}
                </span>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
              >
                {pending ? "…" : t("admin.plans.editor.save")}
              </button>
            </div>
          </div>
        </form>
      ))}
    </div>
  );
}
