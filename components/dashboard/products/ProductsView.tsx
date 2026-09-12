"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import type { Product } from "@prisma/client";
import { IconFileSpreadsheet, IconPencil, type Icon } from "@tabler/icons-react";
import { AddProductForm } from "./AddProductForm";
import { FileUploadTab } from "./FileUploadTab";
import { ProductTable } from "./ProductTable";
import { ProductModal } from "./ProductModal";
import { useLanguage } from "@/lib/i18n/useLanguage";

function TabButton({ active, onClick, icon: TabIcon, children }: { active: boolean; onClick: () => void; icon: Icon; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("inline-flex items-center gap-2 border-b-2 px-1 py-2.5 text-sm font-medium", active ? "border-primary text-ink" : "border-transparent text-muted")}
    >
      <TabIcon size={16} /> {children}
    </button>
  );
}

export function ProductsView({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"manual" | "file">("manual");
  const [editing, setEditing] = useState<Product | null>(null);

  /** Held locally so new rows appear without a server re-render (same newest-first order). */
  const [rows, setRows] = useState(products);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-5 border-b border-border">
        <TabButton active={tab === "manual"} onClick={() => setTab("manual")} icon={IconPencil}>
          {t({ ka: "ხელით შევსება", en: "Manual entry" })}
        </TabButton>
        <TabButton active={tab === "file"} onClick={() => setTab("file")} icon={IconFileSpreadsheet}>
          {t({ ka: "ფაილით ატვირთვა", en: "File upload" })}
        </TabButton>
      </div>
      {tab === "manual" ? (
        <>
          <AddProductForm onAdded={(p) => setRows((prev) => [p, ...prev])} />
          <ProductTable products={rows} onEdit={setEditing} />
        </>
      ) : (
        <FileUploadTab />
      )}
      <ProductModal product={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
