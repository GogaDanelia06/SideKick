"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@prisma/client";
import { IconAlertTriangle, IconCheck, IconStarFilled } from "@tabler/icons-react";
import { updatePlan } from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
const LABEL = "mb-1 block text-[12px] font-medium text-muted";

const ERRORS: Record<string, Bilingual> = {
  name_required: { ka: "სახელი სავალდებულოა", en: "Name is required" },
  bad_price: { ka: "ფასი უნდა იყოს დადებითი მთელი რიცხვი", en: "Price must be a whole number ≥ 0" },
  bad_cap: { ka: "ლიმიტი უნდა იყოს რიცხვი (-1 = შეუზღუდავი)", en: "Limits must be numbers (-1 = unlimited)" },
};

function Num({ name, label, value }: { name: string; label: Bilingual; value: number }) {
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
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
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
                <IconStarFilled size={12} /> {t({ ka: "გამორჩეული", en: "Featured" })}
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={LABEL}>{t({ ka: "სახელი (ქართ.)", en: "Name (KA)" })}</span>
              <input name="name" required defaultValue={p.name} className={INPUT} />
            </label>
            <label className="block">
              <span className={LABEL}>{t({ ka: "სახელი (ინგ.)", en: "Name (EN)" })}</span>
              <input name="nameEn" defaultValue={p.nameEn} className={INPUT} />
            </label>
            <Num name="price" label={{ ka: "ფასი (₾ / თვე)", en: "Price (₾ / mo)" }} value={p.price} />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>{t({ ka: "ფასი — 3 თვე (₾)", en: "Price — 3 months (₾)" })}</span>
              <input
                name="price3m"
                type="number"
                defaultValue={p.price3m ?? ""}
                placeholder={String(p.price * 3)}
                className={INPUT}
              />
            </label>
            <label className="block">
              <span className={LABEL}>{t({ ka: "ფასი — 1 წელი (₾)", en: "Price — 1 year (₾)" })}</span>
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
            {t({
              ka: "ცარიელი = ფასდაკლების გარეშე (თვიური × თვეების რაოდენობა).",
              en: "Empty = no discount (monthly × number of months).",
            })}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Num name="msgLimit" label={{ ka: "შეტყობინება", en: "Messages" }} value={p.msgLimit} />
            <Num name="channelCap" label={{ ka: "არხები", en: "Channels" }} value={p.channelCap} />
            <Num name="userCap" label={{ ka: "მომხმარებელი", en: "Users" }} value={p.userCap} />
            <Num name="productCap" label={{ ka: "პროდუქტი", en: "Products" }} value={p.productCap} />
          </div>

          {/* Five free-form bullets, appended after the ones derived from caps. */}
          <div className="mt-4">
            <span className={LABEL}>
              {t({ ka: "დამატებითი პარამეტრები (5 ველი)", en: "Extra features (5 slots)" })}
            </span>
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <input
                    name={`extraKa${i}`}
                    defaultValue={p.extrasKa[i] ?? ""}
                    placeholder={t({ ka: `${i + 1}. ქართულად`, en: `${i + 1}. Georgian` })}
                    className={INPUT}
                  />
                  <input
                    name={`extraEn${i}`}
                    defaultValue={p.extrasEn[i] ?? ""}
                    placeholder={t({ ka: `${i + 1}. ინგლისურად`, en: `${i + 1}. English` })}
                    className={INPUT}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-muted">
              <input type="checkbox" name="featured" defaultChecked={p.featured} className="accent-[var(--primary)]" />
              {t({ ka: "გამორჩეული პაკეტი", en: "Featured plan" })}
            </label>
            <div className="flex items-center gap-3">
              {savedId === p.id ? (
                <span className="inline-flex items-center gap-1 text-[13px] text-green">
                  <IconCheck size={15} /> {t({ ka: "შენახულია", en: "Saved" })}
                </span>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
              >
                {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
              </button>
            </div>
          </div>
        </form>
      ))}
    </div>
  );
}
