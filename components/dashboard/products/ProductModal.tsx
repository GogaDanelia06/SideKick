"use client";

import { useState, type ComponentProps } from "react";
import type { Product } from "@prisma/client";
import { IconDeviceFloppy, IconEdit, IconX } from "@tabler/icons-react";
import { useToast } from "@/components/dashboard/ui/Toast";
import { updateProduct, type UpdateResult } from "@/lib/dashboard/actions/products";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { PhotoPicker } from "./PhotoPicker";
import { PRODUCT_ERRORS, PRODUCT_SAVED } from "./productErrors";
import { usePricing } from "./usePricing";

const FIELD = "mt-1 w-full rounded-[6px] border border-input bg-soft px-3 py-2.5 text-[13px] text-ink outline-none focus:border-blue";

function Field({ label, ...input }: { label: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <input className={FIELD} {...input} />
    </label>
  );
}

/** Split out so hooks never run behind an early return. */
function EditForm({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useLanguage();
  const money = usePricing(product);
  const notify = useToast();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setError(null);
        const res = await updateProduct(product.id, fd).catch((): UpdateResult => ({ ok: false, error: "error" }));
        if (!res.ok) return setError(res.error);
        notify(t(PRODUCT_SAVED));
        onClose();
      }}
      className="relative w-full max-w-[560px] overflow-hidden rounded-[14px] border border-border bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-[34px] place-items-center rounded-[9px] bg-blue-surface text-blue"><IconEdit size={18} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold">{t("dashboard.products.modal.editProduct")}</div>
          <div className="truncate text-xs text-muted">{product.name}</div>
        </div>
        <button type="button" onClick={onClose} aria-label={t("common.close")} className="grid size-8 place-items-center rounded-[6px] border border-border text-muted"><IconX size={18} /></button>
      </div>
      <div className="flex flex-col gap-3.5 p-5">
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          <PhotoPicker current={product.photos[0]} label={"dashboard.products.modal.changePhoto"} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="name" label={t("dashboard.products.modal.name")} defaultValue={product.name} />
            <Field label={t("dashboard.products.modal.code")} defaultValue={product.code} readOnly className={`${FIELD} cursor-not-allowed font-mono text-faint`} />
            <Field
              name="price"
              label={t("dashboard.products.modal.price")}
              type="number"
              className={`${FIELD} font-mono`}
              value={money.price}
              onChange={(e) => money.onPrice(e.target.value)}
            />
            <Field name="size" label={t("dashboard.products.modal.size")} defaultValue={product.size ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field
            name="discountPct"
            label={t("dashboard.products.modal.discount")}
            type="number"
            value={money.discountPct}
            onChange={(e) => money.onDiscount(e.target.value)}
          />
          <Field
            name="salePrice"
            label={t("dashboard.products.modal.salePrice")}
            type="number"
            className={`${FIELD} font-mono`}
            value={money.salePrice}
            onChange={(e) => money.onSale(e.target.value)}
          />
          <Field name="quantity" label={t("dashboard.products.modal.quantity")} type="number" defaultValue={product.quantity} className={`${FIELD} font-mono`} />
        </div>
        <label className="block">
          <span className="text-[11px] text-muted">{t("dashboard.products.modal.descriptionUsedByAi")}</span>
          <textarea name="description" rows={2} defaultValue={product.description ?? ""} className={FIELD} />
        </label>
        {error ? <p role="alert" className="text-[13px] text-red">{t(PRODUCT_ERRORS[error] ?? PRODUCT_ERRORS.error)}</p> : null}
      </div>
      <div className="flex justify-end gap-2.5 border-t border-border bg-soft px-5 py-4">
        <button type="button" onClick={onClose} className="h-[38px] rounded-[6px] border border-border bg-surface px-4 text-[13px] font-medium">{t("dashboard.products.modal.cancel")}</button>
        <button type="submit" className="inline-flex h-[38px] items-center gap-1.5 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white"><IconDeviceFloppy size={16} /> {t("dashboard.products.modal.save")}</button>
      </div>
    </form>
  );
}

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { t } = useLanguage();
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <button type="button" aria-label={t("common.close")} onClick={onClose} className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]" />
      {/* Keyed by product, so the pricing state resets when another product opens. */}
      <EditForm key={product.id} product={product} onClose={onClose} />
    </div>
  );
}
