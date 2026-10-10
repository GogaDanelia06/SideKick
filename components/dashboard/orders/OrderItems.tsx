import type { OrderRowData } from "@/lib/dashboard/queries";

export function OrderItems({ items }: { items: OrderRowData["items"] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      {items.map((it) => (
        <div
          key={it.id}
          className="flex items-center gap-3 border-b border-border2 px-3 py-2.5 text-[13px] last:border-b-0"
        >
          <span className="min-w-0 flex-1 truncate">{it.name}</span>
          <span className="shrink-0 font-mono text-xs text-muted">{it.code}</span>
          <span className="shrink-0 text-muted">×{it.qty}</span>
          <span className="w-20 shrink-0 text-right font-mono font-semibold">{it.lineTotal}₾</span>
        </div>
      ))}
    </div>
  );
}
