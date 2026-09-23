import type { Membership } from "@prisma/client";
import type { Bilingual } from "@/lib/content/types";

export type Role = Membership["role"];

/** How each role looks on the page, and every word the team page says about a change. */
export const ROLE: Record<Role, { pill: string; title: string; avatar: string; perms: Bilingual; desc: Bilingual }> = {
  OWNER: { pill: "bg-green-surface text-green", title: "text-green", avatar: "bg-primary text-white", perms: { ka: "სრული წვდომა", en: "Full access" }, desc: { ka: "სრული კონტროლი, ბილინგი, გუნდი", en: "Full control, billing, team" } },
  ADMIN: { pill: "bg-blue-surface text-blue", title: "text-blue", avatar: "bg-blue text-white", perms: { ka: "ყველა გვერდი, ბილინგის გარდა", en: "All pages except billing" }, desc: { ka: "ყველა ფუნქცია, ბილინგის გარდა", en: "All features except billing" } },
  OPERATOR: { pill: "bg-ai-surface text-ai", title: "text-ai", avatar: "bg-ai text-on-ai", perms: { ka: "მიმოწერები, შეკვეთები, ლიდები", en: "Chats, orders, leads" }, desc: { ka: "მიმოწერა, შეკვეთა, ლიდები", en: "Chats, orders, leads" } },
  VIEWER: { pill: "bg-soft text-muted", title: "text-muted", avatar: "bg-faint text-white", perms: { ka: "მხოლოდ ნახვა", en: "View only" }, desc: { ka: "მხოლოდ ნახვის უფლება", en: "View permission only" } },
};

export const ROLES: Role[] = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"];

/** Mirrors the server's RANK (lib/dashboard/actions.ts). */
export const RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, OPERATOR: 1, VIEWER: 0 };

export const ERRORS: Record<string, Bilingual> = {
  forbidden: { ka: "ამის უფლება არ გაქვთ", en: "You don't have permission for this" },
  email_required: { ka: "ელფოსტა სავალდებულოა", en: "Email is required" },
  already_member: { ka: "ეს მომხმარებელი უკვე გუნდშია", en: "This person is already on the team" },
  last_owner: { ka: "ბიზნესს ერთი მფლობელი მაინც სჭირდება", en: "A business needs at least one owner" },
  cannot_remove_self: { ka: "საკუთარ თავს ვერ წაშლი", en: "You can't remove yourself" },
  not_found: { ka: "წევრი ვერ მოიძებნა", en: "Member not found" },
  bad_role: { ka: "ასეთი როლი არ არსებობს", en: "That is not a valid role" },
};

export const TEAM_SAVED: Bilingual = { ka: "გუნდი განახლდა", en: "Team updated" };
