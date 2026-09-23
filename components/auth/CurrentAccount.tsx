import { initialOf } from "@/lib/i18n/initial";

/** The account menu's top: who is signed in right now, as in Gmail's account menu. */
export function CurrentAccount({ name, email }: { name: string; email: string }) {
  return (
    <div className="mb-1 flex items-center gap-3 border-b border-border2 px-2.5 pb-2.5 pt-1.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
        {initialOf(name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">{name}</span>
        <span className="block truncate text-[11px] text-muted">{email}</span>
      </span>
    </div>
  );
}
