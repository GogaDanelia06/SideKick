"use client";

import type { ComponentProps } from "react";
import { IconPhoto, IconPlus } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { createProduct } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const FIELD = "mt-1 w-full rounded-[6px] border border-input bg-soft px-3 py-2.5 text-[13px] outline-none focus:border-blue";

function Field({ label, ...input }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <input className={FIELD} {...input} />
    </label>
  );
}

export function AddProductForm() {
  const { t } = useLanguage();
  return (
    <Panel className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <IconPlus size={16} className="text-primary" /> {t({ ka: "პროდუქტის დამატება", en: "Add product" })}
      </h3>
      <form action={createProduct} className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div className="grid h-[120px] place-items-center rounded-[10px] border-[1.5px] border-dashed border-border bg-soft text-center text-[11px] text-faint">
          <span><IconPhoto size={24} className="mx-auto" /><span className="mt-1 block">{t({ ka: "ფოტოს ატვირთვა", en: "Upload photo" })}</span></span>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field name="name" label={t({ ka: "დასახელება", en: "Name" })} required />
            <Field name="code" label={t({ ka: "კოდი", en: "Code" })} required />
            <Field name="price" label={t({ ka: "ფასი", en: "Price" })} type="number" />
            <Field name="size" label={t({ ka: "ზომა", en: "Size" })} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field name="discountPct" label={t({ ka: "ფასდაკლება %", en: "Discount %" })} type="number" />
            <Field name="salePrice" label={t({ ka: "ფასდაკლ. ფასი", en: "Sale price" })} type="number" />
            <Field name="quantity" label={t({ ka: "რაოდენობა", en: "Quantity" })} type="number" />
          </div>
          <label className="block">
            <span className="text-[11px] text-muted">{t({ ka: "აღწერა (AI იყენებს იდენტიფიკაციისთვის)", en: "Description (used by AI for matching)" })}</span>
            <textarea name="description" rows={2} className={FIELD} />
          </label>
          <div className="flex justify-end">
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white">
              <IconPlus size={16} /> {t({ ka: "დამატება", en: "Add" })}
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
