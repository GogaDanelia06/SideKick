import type { Membership } from "@prisma/client";
import type { Text } from "@/lib/i18n/messages";

export type Role = Membership["role"];

/** How each role looks on the page, and every word the team page says about a change. */
export const ROLE: Record<Role, { pill: string; title: string; avatar: string; perms: Text; desc: Text }> = {
  OWNER: { pill: "bg-green-surface text-green", title: "text-green", avatar: "bg-primary text-white", perms: "dashboard.team.messages.fullAccess", desc: "dashboard.team.messages.fullControlBillingTeam" },
  ADMIN: { pill: "bg-blue-surface text-blue", title: "text-blue", avatar: "bg-blue text-white", perms: "dashboard.team.messages.allPagesExceptBilling", desc: "dashboard.team.messages.allFeaturesExceptBilling" },
  OPERATOR: { pill: "bg-ai-surface text-ai", title: "text-ai", avatar: "bg-ai text-on-ai", perms: "dashboard.team.messages.chatsOrdersLeads", desc: "dashboard.team.messages.chatsOrdersLeads2" },
  VIEWER: { pill: "bg-soft text-muted", title: "text-muted", avatar: "bg-faint text-white", perms: "dashboard.team.messages.viewOnly", desc: "dashboard.team.messages.viewPermissionOnly" },
};

export const ROLES: Role[] = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"];

/** Mirrors the server's RANK (lib/dashboard/actions.ts). */
export const RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, OPERATOR: 1, VIEWER: 0 };

export const ERRORS: Record<string, Text> = {
  forbidden: "dashboard.team.messages.youDonTHave",
  email_required: "dashboard.team.messages.emailIsRequired",
  already_member: "dashboard.team.messages.thisPersonIsAlready",
  last_owner: "dashboard.team.messages.aBusinessNeedsAt",
  cannot_remove_self: "dashboard.team.messages.youCanTRemove",
  not_found: "dashboard.team.messages.memberNotFound",
  bad_role: "dashboard.team.messages.thatIsNotA",
};

export const TEAM_SAVED: Text = "dashboard.team.messages.teamUpdated";
