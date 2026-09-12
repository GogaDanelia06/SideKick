import type { Role } from "@prisma/client";

/** Role ranks: nobody may grant, change or remove a role above their own. */
export const ROLE_RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, OPERATOR: 1, VIEWER: 0 };

/** Server action arguments are untyped at runtime. */
export function isRole(value: string): value is Role {
  return Object.hasOwn(ROLE_RANK, value);
}

export function rankOf(role: string): number {
  return isRole(role) ? ROLE_RANK[role] : -1;
}
