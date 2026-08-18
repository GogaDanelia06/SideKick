"use client";

import { useTransition } from "react";
import clsx from "clsx";
import type { Product } from "@prisma/client";
import { IconEdit, IconPhoto, IconTrash } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { deleteProduct } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ICON_BTN = "grid size-[30px] place-items-center rounded-[6px] border border-border bg-surface";

/** Empty, nearly empty, or fine — read at a glance rather than counted. */
const stockCls = (n: number) => (n === 0 ? "text-red" : n < 5 ? "text-amber" : "text-ink");

/** Column widths, shared by the header and the rows so they cannot drift apart. */
const COL = { price: "w-[92px]", sale: "w-[104px]", stock: "w-[96px]" };

export function ProductTable({ products, onEdit }: { products: Product[]; onEdit: (p: Product) => void }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h3 className="text-sm font-semibold">{t({ ka: "პროდუქტების ჩამონათვალი", en: "Product list" })}</h3>
        <span className="text-xs text-muted">
          {t({ ka: `სულ ${products.length} პროდუქტი`, en: `${products.length} products` })}
        </span>
      </div>

      {/* Column names. Three bare numbers in a row — 3500, 3000, 12 — asked the
          reader to guess which was the price, which the discount and which the
          stock. Naming them is the whole fix, and the names have to sit in the
          same widths as the values or they label the wrong column. */}
      {products.length > 0 ? (
        <div className="hidden items-center gap-3 border-b border-border bg-soft px-4 py-2 text-[11px] uppercase tracking-wide text-faint sm:flex">
          <span className="size-10 shrink-0" />
          <span className="min-w-0 flex-1">{t({ ka: "პროდუქტი", en: "Product" })}</span>
          <span className={clsx(COL.price, "text-right")}>{t({ ka: "ფასი", en: "Price" })}</span>
          <span className={clsx(COL.sale, "hidden text-right md:block")}>
            {t({ ka: "ფასდაკლებით", en: "Sale price" })}
          </span>
          <span className={clsx(COL.stock, "text-right")}>{t({ ka: "მარაგში", en: "In stock" })}</span>
          <span className="w-[72px] shrink-0" />
        </div>
      ) : null}

      {products.map((p) => {
        const off =
          p.salePrice && p.price > 0 ? Math.round((1 - p.salePrice / p.price) * 100) : null;

        return (
          <div key={p.id} className="flex items-center gap-3 border-b border-border2 px-4 py-3 last:border-b-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-soft text-faint">
              <IconPhoto size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.name}</div>
              <div className="font-mono text-xs text-muted">{p.code}</div>
            </div>

            {/* Struck through when there is a sale price, because then it is what
                the customer does *not* pay, and the two numbers side by side
                otherwise read as a range. */}
            <div className={clsx(COL.price, "hidden text-right font-mono text-sm sm:block")}>
              <span className={p.salePrice ? "text-muted line-through" : undefined}>{p.price}₾</span>
            </div>

            <div className={clsx(COL.sale, "hidden text-right md:block")}>
              {p.salePrice ? (
                <>
                  <div className="font-mono text-sm font-medium text-primary">{p.salePrice}₾</div>
                  {off ? <div className="text-[11px] text-primary/80">−{off}%</div> : null}
                </>
              ) : (
                <span className="font-mono text-sm text-faint">—</span>
              )}
            </div>

            <div className={clsx(COL.stock, "text-right font-mono text-sm", stockCls(p.quantity))}>
              {p.quantity === 0 ? t({ ka: "ამოიწურა", en: "Out of stock" }) : p.quantity}
            </div>

            <div className="flex w-[72px] shrink-0 justify-end gap-1.5">
              <button type="button" onClick={() => onEdit(p)} aria-label={t({ ka: "რედაქტირება", en: "Edit" })} className={clsx(ICON_BTN, "text-blue")}>
                <IconEdit size={16} />
              </button>
              <button type="button" disabled={pending} onClick={() => start(() => deleteProduct(p.id))} aria-label={t({ ka: "წაშლა", en: "Delete" })} className={clsx(ICON_BTN, "text-red disabled:opacity-50")}>
                <IconTrash size={16} />
              </button>
            </div>
          </div>
        );
      })}

      {products.length === 0 && (
        <div className="px-4 py-10 text-center text-sm text-muted">
          {t({ ka: "პროდუქტები არ არის", en: "No products" })}
        </div>
      )}
    </Panel>
  );
}
