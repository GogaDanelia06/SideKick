import type { Role } from "@prisma/client";
import { getContext, type Ctx } from "@/lib/session";

/**
 * Who may do what.
 *
 * This mirrors the role descriptions already shown on the team screen, so the
 * promise made in the UI and the rule enforced on the server are the same thing:
 *
 *   OWNER     სრული წვდომა
 *   ADMIN     ყველა გვერდი, ბილინგის გარდა
 *   OPERATOR  მიმოწერები, შეკვეთები, ლიდები
 *   VIEWER    მხოლოდ ნახვა
 *
 * Enforcement lives here, on the server. Hiding a button in the UI is a
 * convenience, not a control — a request can always be crafted by hand.
 */

export type Permission =
  | "products:write"
  | "leads:write"
  | "orders:write"
  | "conversations:write"
  | "channels:write"
  | "ai:write"
  | "videos:write"
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
  "videos:write",
  "business:write",
  "team:manage",
];

/** VIEWER holds no write permission at all — read-only, as advertised. */
const MATRIX: Record<Role, Permission[]> = {
  OWNER: [...ADMIN_SCOPE, "billing:manage"],
  ADMIN: ADMIN_SCOPE,
  OPERATOR: OPERATOR_SCOPE,
  VIEWER: [],
};

/** Pure check — safe to use in server components to decide what to render. */
export function can(role: string, permission: Permission): boolean {
  const scope = MATRIX[role as Role];
  return Array.isArray(scope) && scope.includes(permission);
}

/** Every permission a role holds — handy for passing a capability set to the UI. */
export function permissionsFor(role: string): Permission[] {
  return MATRIX[role as Role] ?? [];
}

/**
 * Session context, but only if the caller holds the permission.
 *
 * Returns null when signed out OR not allowed — callers treat both the same
 * way (do nothing), so a denied action can't be distinguished from a missing
 * session by probing.
 */
export async function requirePermission(permission: Permission): Promise<Ctx | null> {
  const ctx = await getContext();
  if (!ctx) return null;
  return can(ctx.role, permission) ? ctx : null;
}
