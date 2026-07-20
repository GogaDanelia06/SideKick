"use client";

import type { Membership, User } from "@prisma/client";
import { IconDots } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

type Member = Membership & { user: User };

const ROLE: Record<Membership["role"], { pill: string; title: string; avatar: string; perms: Bilingual; desc: Bilingual }> = {
  OWNER: { pill: "bg-green-surface text-green", title: "text-green", avatar: "bg-primary", perms: { ka: "სრული წვდომა", en: "Full access" }, desc: { ka: "სრული კონტროლი, ბილინგი, გუნდი", en: "Full control, billing, team" } },
  ADMIN: { pill: "bg-blue-surface text-blue", title: "text-blue", avatar: "bg-blue", perms: { ka: "ყველა გვერდი, ბილინგის გარდა", en: "All pages except billing" }, desc: { ka: "ყველა ფუნქცია, ბილინგის გარდა", en: "All features except billing" } },
  OPERATOR: { pill: "bg-ai-surface text-ai", title: "text-ai", avatar: "bg-ai", perms: { ka: "მიმოწერები, შეკვეთები, ლიდები", en: "Chats, orders, leads" }, desc: { ka: "მიმოწერა, შეკვეთა, ლიდები", en: "Chats, orders, leads" } },
  VIEWER: { pill: "bg-soft text-muted", title: "text-muted", avatar: "bg-faint", perms: { ka: "მხოლოდ ნახვა", en: "View only" }, desc: { ka: "მხოლოდ ნახვის უფლება", en: "View permission only" } },
};

const cap = (r: string) => r[0] + r.slice(1).toLowerCase();

export function TeamView({ members }: { members: Member[] }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-amber px-3 py-1 text-xs font-medium text-amber">{t({ ka: "მეორე ეტაპი", en: "Second stage" })}</span>
        <button type="button" className="rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-white">{t({ ka: "წევრის დამატება", en: "Add member" })}</button>
      </div>
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-semibold">{t({ ka: "წევრი", en: "Member" })}</th>
              <th className="px-4 py-3 font-semibold">{t({ ka: "როლი", en: "Role" })}</th>
              <th className="px-4 py-3 font-semibold">{t({ ka: "უფლებები", en: "Permissions" })}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const r = ROLE[m.role];
              return (
                <tr key={m.id} className="border-b border-border2 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${r.avatar}`}>{(m.user.name ?? m.user.email)[0]?.toUpperCase()}</span>
                      <div className="min-w-0"><div className="truncate font-medium">{m.user.name ?? "—"}</div><div className="truncate text-xs text-muted">{m.user.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.pill}`}>{cap(m.role)}</span></td>
                  <td className="px-4 py-3 text-muted">{t(r.perms)}</td>
                  <td className="px-4 py-3 text-right"><button type="button" aria-label="Menu" className="inline-grid size-8 place-items-center rounded-[6px] border border-border text-muted"><IconDots size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLE) as Membership["role"][]).map((r) => (
          <Panel key={r} className="p-4">
            <div className={`text-sm font-semibold ${ROLE[r].title}`}>{cap(r)}</div>
            <p className="mt-1.5 text-xs text-muted">{t(ROLE[r].desc)}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
