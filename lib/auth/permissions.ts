import type { Role } from "@prisma/client";
import { getContext, type Ctx } from "@/lib/session";

export type Permission =
  | "products:write"
  | "leads:write"
  | "orders:write"
  | "conversations:write"
  | "channels:write"
  | "ai:write"
  | "business:write"
  | "team:manage"
  | "billing:manage";

const OPERATOR_SCOPE: Permission[] = [
  "leads:write",
  "orders:write",
  "conversations:write",
];

const ADMIN_SCOPE: Permission[] = [
  ...OPERATOR_SCOPE,
  "products:write",
  "channels:write",
  "ai:write",
  "business:write",
  "team:manage",
];

const MATRIX: Record<Role, Permission[]> = {
  OWNER: [...ADMIN_SCOPE, "billing:manage"],
  ADMIN: ADMIN_SCOPE,
  OPERATOR: OPERATOR_SCOPE,
  VIEWER: [],
};

export function can(role: string, permission: Permission): boolean {
  const scope = MATRIX[role as Role];
  return Array.isArray(scope) && scope.includes(permission);
}

export function permissionsFor(role: string): Permission[] {
  return MATRIX[role as Role] ?? [];
}

export async function requirePermission(permission: Permission): Promise<Ctx | null> {
  const ctx = await getContext();
  if (!ctx) return null;
  return can(ctx.role, permission) ? ctx : null;
}
