import type { Icon } from "@tabler/icons-react";
import { BiText } from "@/components/admin/ui/BiText";
import type { Text } from "@/lib/i18n/messages";

export function StatCard({
  icon: Glyph,
  label,
  value,
  sub,
}: {
  icon: Icon;
  label: Text;
  value: string;
  sub?: Text;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-blue-surface text-blue">
          <Glyph size={18} />
        </span>
        <BiText className="text-[13px] text-muted" value={label} />
      </div>
      <div className="font-mono text-[28px] font-medium leading-none">{value}</div>
      {sub ? <BiText as="div" className="mt-1.5 text-[12px] text-faint" value={sub} /> : null}
    </div>
  );
}
