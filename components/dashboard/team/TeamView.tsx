"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Membership, User } from "@prisma/client";
import { IconAlertTriangle, IconDots, IconPlus, IconTrash, IconUserCog, IconX } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { addTeamMember, removeTeamMember, updateMemberRole } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

type Member = Membership & { user: User };
type Role = Membership["role"];

const ROLE: Record<Role, { pill: string; title: string; avatar: string; perms: Bilingual; desc: Bilingual }> = {
  OWNER: { pill: "bg-green-surface text-green", title: "text-green", avatar: "bg-primary", perms: { ka: "სრული წვდომა", en: "Full access" }, desc: { ka: "სრული კონტროლი, ბილინგი, გუნდი", en: "Full control, billing, team" } },
  ADMIN: { pill: "bg-blue-surface text-blue", title: "text-blue", avatar: "bg-blue", perms: { ka: "ყველა გვერდი, ბილინგის გარდა", en: "All pages except billing" }, desc: { ka: "ყველა ფუნქცია, ბილინგის გარდა", en: "All features except billing" } },
  OPERATOR: { pill: "bg-ai-surface text-ai", title: "text-ai", avatar: "bg-ai", perms: { ka: "მიმოწერები, შეკვეთები, ლიდები", en: "Chats, orders, leads" }, desc: { ka: "მიმოწერა, შეკვეთა, ლიდები", en: "Chats, orders, leads" } },
  VIEWER: { pill: "bg-soft text-muted", title: "text-muted", avatar: "bg-faint", perms: { ka: "მხოლოდ ნახვა", en: "View only" }, desc: { ka: "მხოლოდ ნახვის უფლება", en: "View permission only" } },
};

const ROLES: Role[] = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"];
const cap = (r: string) => r[0] + r.slice(1).toLowerCase();

/** Server-side failure codes → readable text. */
const ERRORS: Record<string, Bilingual> = {
  forbidden: { ka: "ამის უფლება არ გაქვთ", en: "You don't have permission for this" },
  email_required: { ka: "ელფოსტა სავალდებულოა", en: "Email is required" },
  already_member: { ka: "ეს მომხმარებელი უკვე გუნდშია", en: "This person is already on the team" },
  last_owner: { ka: "ბიზნესს ერთი მფლობელი მაინც სჭირდება", en: "A business needs at least one owner" },
  cannot_remove_self: { ka: "საკუთარ თავს ვერ წაშლი", en: "You can't remove yourself" },
  not_found: { ka: "წევრი ვერ მოიძებნა", en: "Member not found" },
};

export function TeamView({
  members,
  currentUserId,
  currentRole,
}: {
  members: Member[];
  currentUserId: string;
  currentRole: string;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  // Close the row menu on any outside click.
  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuFor]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "unknown");
      else after?.();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-amber px-3 py-1 text-xs font-medium text-amber">
          {t({ ka: "მეორე ეტაპი", en: "Second stage" })}
        </span>
        {canManage ? (
          <button
            type="button"
            onClick={() => { setAdding(true); setError(null); }}
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            <IconPlus size={16} />
            {t({ ka: "წევრის დამატება", en: "Add member" })}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[8px] border border-red bg-red-surface px-3.5 py-2.5 text-[13px] text-red">
          <IconAlertTriangle size={16} className="shrink-0" />
          {t(ERRORS[error] ?? { ka: "ვერ შესრულდა", en: "Something went wrong" })}
        </div>
      ) : null}

      {adding ? (
        <Panel className="p-4">
          <form
            ref={formRef}
            action={(fd) =>
              run(() => addTeamMember(fd), () => { formRef.current?.reset(); setAdding(false); })
            }
            className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto]"
          >
            <input
              name="name"
              placeholder={t({ ka: "სახელი გვარი", en: "Full name" })}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
            />
            <input
              name="email"
              type="email"
              required
              placeholder={t({ ka: "ელფოსტა *", en: "Email *" })}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
            />
            <select
              name="role"
              defaultValue="OPERATOR"
              aria-label={t({ ka: "როლი", en: "Role" })}
              className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none focus:border-blue"
            >
              {ROLES.map((r) => <option key={r} value={r}>{cap(r)}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="h-10 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
              >
                {pending ? "…" : t({ ka: "დამატება", en: "Add" })}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setError(null); }}
                aria-label={t({ ka: "გაუქმება", en: "Cancel" })}
                className="grid size-10 place-items-center rounded-[8px] border border-border text-muted"
              >
                <IconX size={16} />
              </button>
            </div>
          </form>
          <p className="mt-2.5 text-xs text-muted">
            {t({
              ka: "წევრი დაემატება ანგარიშით. პაროლს თავად დააყენებს „პაროლის აღდგენით“.",
              en: "The member is added with an account. They set their own password via “forgot password”.",
            })}
          </p>
        </Panel>
      ) : null}

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
              const isSelf = m.userId === currentUserId;
              const open = menuFor === m.id;
              return (
                <tr key={m.id} className="border-b border-border2 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${r.avatar}`}>
                        {(m.user.name ?? m.user.email)[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {m.user.name ?? "—"}
                          {isSelf ? <span className="ml-1.5 text-xs text-muted">({t({ ka: "თქვენ", en: "you" })})</span> : null}
                        </div>
                        <div className="truncate text-xs text-muted">{m.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.pill}`}>{cap(m.role)}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{t(r.perms)}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage ? (
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          aria-label={t({ ka: "მოქმედებები", en: "Actions" })}
                          aria-expanded={open}
                          onClick={() => setMenuFor(open ? null : m.id)}
                          className="inline-grid size-8 place-items-center rounded-[6px] border border-border text-muted hover:border-blue hover:text-ink"
                        >
                          <IconDots size={16} />
                        </button>

                        {open ? (
                          <div className="absolute right-0 z-30 mt-1 w-56 rounded-[10px] border border-border bg-surface p-1.5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-faint">
                              <IconUserCog size={13} /> {t({ ka: "როლის შეცვლა", en: "Change role" })}
                            </div>
                            {ROLES.map((role) => (
                              <button
                                key={role}
                                type="button"
                                disabled={pending || role === m.role}
                                onClick={() => run(() => updateMemberRole(m.id, role), () => setMenuFor(null))}
                                className="flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-[13px] hover:bg-soft disabled:opacity-40"
                              >
                                {cap(role)}
                                {role === m.role ? <span className="text-xs text-muted">✓</span> : null}
                              </button>
                            ))}
                            <div className="my-1 border-t border-border2" />
                            <button
                              type="button"
                              disabled={pending || isSelf}
                              title={isSelf ? t({ ka: "საკუთარ თავს ვერ წაშლი", en: "You can't remove yourself" }) : undefined}
                              onClick={() => run(() => removeTeamMember(m.id), () => setMenuFor(null))}
                              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-[13px] text-red hover:bg-soft disabled:opacity-40"
                            >
                              <IconTrash size={15} />
                              {t({ ka: "გუნდიდან წაშლა", en: "Remove from team" })}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => (
          <Panel key={r} className="p-4">
            <div className={`text-sm font-semibold ${ROLE[r].title}`}>{cap(r)}</div>
            <p className="mt-1.5 text-xs text-muted">{t(ROLE[r].desc)}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
