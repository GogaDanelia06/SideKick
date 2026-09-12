"use client";

import { type ComponentProps, useRef, useState, useTransition } from "react";
import { IconCheck, IconPhoto, IconPlus } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { createProduct } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Product } from "@prisma/client";
import type { Bilingual } from "@/lib/content/types";
import { usePricing } from "./usePricing";

const FIELD = "mt-1 w-full rounded-[6px] border border-input bg-soft px-3 py-2.5 text-[13px] outline-none focus:border-blue";

function Field({ label, ...input }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <input className={FIELD} {...input} />
    </label>
  );
}

const ERRORS: Record<string, Bilingual> = {
  missing: { ka: "დასახელება და კოდი სავალდებულოა.", en: "Name and code are required." },
  duplicate: {
    ka: "ეს კოდი უკვე გაქვს სხვა პროდუქტზე. მიუთითე სხვა.",
    en: "That code is already used by another product. Pick a different one.",
  },
  limit: {
    ka: "შენი გეგმა მეტ პროდუქტს არ უშვებს. წაშალე რამე ან გეგმა შეცვალე.",
    en: "Your plan does not allow more products. Delete one, or change the plan.",
  },
  forbidden: { ka: "პროდუქტის დამატების უფლება არ გაქვს.", en: "You may not add products." },
  error: { ka: "ვერ დაემატა. სცადე ხელახლა.", en: "Could not add it. Try again." },
};

export function AddProductForm({ onAdded }: { onAdded: (product: Product) => void }) {
  const { t } = useLanguage();
  const money = usePricing();
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; key?: string } | null>(null);

  return (
    <Panel className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <IconPlus size={16} className="text-primary" /> {t({ ka: "პროდუქტის დამატება", en: "Add product" })}
      </h3>
      <form
        ref={form}
        action={(fd) =>
          start(async () => {
            setNotice(null);
            const res = await createProduct(fd);
            if (res.ok) {
              form.current?.reset();
              money.reset();
              setNotice({ tone: "ok" });
              onAdded(res.product);
            } else {
              setNotice({ tone: "bad", key: res.error });
            }
          })
        }
        className="grid gap-4 sm:grid-cols-[120px_1fr]"
      >
        <div className="grid h-[120px] place-items-center rounded-[10px] border-[1.5px] border-dashed border-border bg-soft text-center text-[11px] text-faint">
          <span><IconPhoto size={24} className="mx-auto" /><span className="mt-1 block">{t({ ka: "ფოტოს ატვირთვა", en: "Upload photo" })}</span></span>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field name="name" label={t({ ka: "დასახელება", en: "Name" })} required />
            <Field name="code" label={t({ ka: "კოდი", en: "Code" })} required />
            <Field
              name="price"
              label={t({ ka: "ფასი", en: "Price" })}
              type="number"
              value={money.price}
              onChange={(e) => money.onPrice(e.target.value)}
            />
            <Field name="size" label={t({ ka: "ზომა", en: "Size" })} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field
              name="discountPct"
              label={t({ ka: "ფასდაკლება %", en: "Discount %" })}
              type="number"
              value={money.discountPct}
              onChange={(e) => money.onDiscount(e.target.value)}
            />
            <Field
              name="salePrice"
              label={t({ ka: "ფასდაკლ. ფასი", en: "Sale price" })}
              type="number"
              value={money.salePrice}
              onChange={(e) => money.onSale(e.target.value)}
            />
            <Field name="quantity" label={t({ ka: "რაოდენობა", en: "Quantity" })} type="number" />
          </div>
          <label className="block">
            <span className="text-[11px] text-muted">{t({ ka: "აღწერა (AI იყენებს იდენტიფიკაციისთვის)", en: "Description (used by AI for matching)" })}</span>
            <textarea name="description" rows={2} className={FIELD} />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {notice ? (
              <p
                className={`mr-auto inline-flex items-center gap-1.5 text-[13px] ${notice.tone === "ok" ? "text-green" : "text-red"}`}
              >
                {notice.tone === "ok" ? <IconCheck size={15} /> : null}
                {notice.tone === "ok"
                  ? t({ ka: "პროდუქტი დაემატა.", en: "Product added." })
                  : t(ERRORS[notice.key ?? "error"] ?? ERRORS.error)}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
            >
              <IconPlus size={16} />
              {pending ? t({ ka: "ემატება…", en: "Adding…" }) : t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
