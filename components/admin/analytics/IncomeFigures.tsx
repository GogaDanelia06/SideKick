import { BiText } from "@/components/admin/ui/BiText";
import type { Text } from "@/lib/i18n/messages";

export function Figure({
  label,
  value,
  sub,
  strong,
}: {
  label: Text;
  value: string;
  sub?: Text;
  strong?: boolean;
}) {
  return (
    <div>
      <BiText className="text-[12px] text-muted" value={label} />
      <div
        className={`mt-1 font-mono font-medium leading-none ${
          strong ? "text-[32px] text-green" : "text-[24px]"
        }`}
      >
        {value}
      </div>
      {sub ? <BiText as="div" className="mt-1.5 text-[12px] text-faint" value={sub} /> : null}
    </div>
  );
}

export function SubCount({ label, count, tone }: { label: Text; count: number; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BiText value={label} />
      <span className={`font-mono ${tone}`}>{count}</span>
    </span>
  );
}
