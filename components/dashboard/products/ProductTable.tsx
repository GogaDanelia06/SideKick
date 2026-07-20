"use client";

import { useTransition } from "react";
import clsx from "clsx";
import type { Product } from "@prisma/client";
import { IconEdit, IconPhoto, IconTrash } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { deleteProduct } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ICON_BTN = "grid size-[30px] place-items-center rounded-[6px] border border-border bg-surface";
const stockCls = (n: number) => (n === 0 ? "text-red" : n < 5 ? "text-amber" : "text-ink");

export function ProductTable({ products, onEdit }: { products: Product[]; onEdit: (p: Product) => void }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h3 className="text-sm font-semibold">{t({ ka: "პროდუქტების ჩამონათვალი", en: "Product list" })}</h3>
        <span className="text-xs text-muted">{t({ ka: `სულ ${products.length} პროდუქტი`, en: `${products.length} products` })}</span>
      </div>
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 border-b border-border2 px-4 py-3 last:border-b-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-soft text-faint"><IconPhoto size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{p.name}</div>
            <div className="font-mono text-xs text-muted">{p.code}</div>
          </div>
          <div className="hidden w-20 text-right font-mono text-sm sm:block">{p.price}₾</div>
          <div className="hidden w-20 text-right font-mono text-sm text-primary md:block">{p.salePrice ? `${p.salePrice}₾` : "—"}</div>
          <div className={clsx("w-24 text-right font-mono text-sm", stockCls(p.quantity))}>
            {p.quantity === 0 ? t({ ka: "0 · ამოიწურა", en: "0 · out" }) : p.quantity}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button type="button" onClick={() => onEdit(p)} aria-label="Edit" className={clsx(ICON_BTN, "text-blue")}><IconEdit size={16} /></button>
            <button type="button" disabled={pending} onClick={() => start(() => deleteProduct(p.id))} aria-label="Delete" className={clsx(ICON_BTN, "text-red disabled:opacity-50")}><IconTrash size={16} /></button>
          </div>
        </div>
      ))}
      {products.length === 0 && <div className="px-4 py-10 text-center text-sm text-muted">{t({ ka: "პროდუქტები არ არის", en: "No products" })}</div>}
    </Panel>
  );
}
