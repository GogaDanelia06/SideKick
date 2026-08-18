import { BiText } from "@/components/admin/ui/BiText";
import type { Bilingual } from "@/lib/content/types";

export type Row = {
  key: string;
  /** Either a translated label or a path — both are rendered as given. */
  label: Bilingual | string;
  value: number;
  /** A quieter second figure, e.g. the same count over seven days. */
  aside?: string;
  mono?: boolean;
};

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * A ranked list where the magnitudes are visible, not just printed.
 *
 * These were two columns of right-aligned numbers, and comparing "413" against
 * "109" against "65" meant reading each one and holding it. A bar behind the row,
 * scaled to the largest, answers the only question the list is really asked —
 * which of these is big — before any of the numbers are read.
 *
 * Scaled to the top row rather than the total, because the rows are a top-N and
 * do not sum to anything meaningful; a share-of-total bar would be a lie about a
 * denominator we cropped.
 */
export function RankedList({
  title,
  rows,
  note,
}: {
  title: Bilingual;
  rows: Row[];
  note?: Bilingual;
}) {
  const top = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div>
      <BiText as="h3" className="mb-2 text-[13px] font-semibold" value={title} />

      {rows.length === 0 ? (
        <BiText
          as="p"
          className="py-2 text-[12px] text-faint"
          value={{ ka: "ჯერ არაფერი", en: "Nothing yet" }}
        />
      ) : (
        <div className="flex flex-col">
          {rows.map((r) => (
            <div key={r.key} className="border-b border-border2 py-2 last:border-0">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                {typeof r.label === "string" ? (
                  <span className="truncate font-mono text-muted">{r.label}</span>
                ) : (
                  <BiText className="truncate text-muted" value={r.label} />
                )}
                <span className="flex shrink-0 items-baseline gap-3">
                  <span className="font-mono tabular-nums">{fmt(r.value)}</span>
                  {r.aside ? (
                    <span className="w-[68px] text-right font-mono text-[11px] tabular-nums text-faint">
                      {r.aside}
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-blue/45"
                  style={{ width: `${Math.max(1, (r.value / top) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {note ? <BiText as="p" className="mt-1.5 text-[11px] text-faint" value={note} /> : null}
    </div>
  );
}
