import type { Role } from "@prisma/client";
import { can } from "@/lib/auth/permissions";

export function canManageTeam(role: string) {
  return can(role, "team:manage");
}

export const RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, OPERATOR: 1, VIEWER: 0 };

export function isRole(value: string): value is Role {
  return value in RANK;
}

export const rankOf = (role: string) => (isRole(role) ? RANK[role] : -1);
