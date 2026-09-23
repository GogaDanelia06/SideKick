"use client";

import { type ComponentProps, useRef, useState, useTransition } from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { createProduct, type ProductResult } from "@/lib/dashboard/actions/products";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Product } from "@prisma/client";
import { PhotoPicker } from "./PhotoPicker";
import { PRODUCT_ERRORS } from "./productErrors";
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

export function AddProductForm({ onAdded }: { onAdded: (product: Product) => void }) {
  const { t } = useLanguage();
  const money = usePricing();
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; key?: string } | null>(null);
  // A new key empties the photo box once a product is added.
  const [photoKey, setPhotoKey] = useState(0);

  return (
    <Panel className="p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <IconPlus size={16} className="text-primary" /> {t("dashboard.products.addProductForm.addProduct")}
      </h3>
      <form
        ref={form}
        action={(fd) =>
          start(async () => {
            setNotice(null);
            const res = await createProduct(fd).catch((): ProductResult => ({ ok: false, error: "error" }));
            if (res.ok) {
              form.current?.reset();
              money.reset();
              setPhotoKey((k) => k + 1);
              setNotice({ tone: "ok" });
              onAdded(res.product);
            } else {
              setNotice({ tone: "bad", key: res.error });
            }
          })
        }
        className="grid gap-4 sm:grid-cols-[120px_1fr]"
      >
        <PhotoPicker key={photoKey} label={"dashboard.products.addProductForm.uploadPhoto"} />
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field name="name" label={t("dashboard.products.addProductForm.name")} required />
            <Field name="code" label={t("dashboard.products.addProductForm.code")} required />
            <Field
              name="price"
              label={t("dashboard.products.addProductForm.price")}
              type="number"
              value={money.price}
              onChange={(e) => money.onPrice(e.target.value)}
            />
            <Field name="size" label={t("dashboard.products.addProductForm.size")} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field
              name="discountPct"
              label={t("dashboard.products.addProductForm.discount")}
              type="number"
              value={money.discountPct}
              onChange={(e) => money.onDiscount(e.target.value)}
            />
            <Field
              name="salePrice"
              label={t("dashboard.products.addProductForm.salePrice")}
              type="number"
              value={money.salePrice}
              onChange={(e) => money.onSale(e.target.value)}
            />
            <Field name="quantity" label={t("dashboard.products.addProductForm.quantity")} type="number" />
          </div>
          <label className="block">
            <span className="text-[11px] text-muted">{t("dashboard.products.addProductForm.descriptionUsedByAi")}</span>
            <textarea name="description" rows={2} className={FIELD} />
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {notice ? (
              <p
                className={`mr-auto inline-flex items-center gap-1.5 text-[13px] ${notice.tone === "ok" ? "text-green" : "text-red"}`}
              >
                {notice.tone === "ok" ? <IconCheck size={15} /> : null}
                {notice.tone === "ok"
                  ? t("dashboard.products.addProductForm.productAdded")
                  : t(PRODUCT_ERRORS[notice.key ?? "error"] ?? PRODUCT_ERRORS.error)}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
            >
              <IconPlus size={16} />
              {pending ? t("dashboard.products.addProductForm.adding") : t("dashboard.products.addProductForm.add")}
            </button>
          </div>
        </div>
      </form>
    </Panel>
  );
}
