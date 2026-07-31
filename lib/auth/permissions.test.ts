import { describe, it, expect, vi, beforeEach } from "vitest";
import { can, permissionsFor, requirePermission, type Permission } from "./permissions";

vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
import { getContext } from "@/lib/session";
const mockedGetContext = vi.mocked(getContext);

const ROLES = ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] as const;

const ALL_PERMISSIONS: Permission[] = [
  "products:write",
  "leads:write",
  "orders:write",
  "conversations:write",
  "channels:write",
  "ai:write",
  "business:write",
  "team:manage",
  "billing:manage",
];

const EXPECTED: Record<(typeof ROLES)[number], Permission[]> = {
  OWNER: ALL_PERMISSIONS,
  ADMIN: [
    "leads:write",
    "orders:write",
    "conversations:write",
    "products:write",
    "channels:write",
    "ai:write",
    "business:write",
    "team:manage",
  ],
  OPERATOR: ["leads:write", "orders:write", "conversations:write"],
  VIEWER: [],
};

describe("can()", () => {
  for (const role of ROLES) {
    const granted = new Set(EXPECTED[role]);
    for (const perm of ALL_PERMISSIONS) {
      const should = granted.has(perm);
      it(`${role} ${should ? "may" : "may NOT"} ${perm}`, () => {
        expect(can(role, perm)).toBe(should);
      });
    }
  }

  it("only OWNER may manage billing", () => {
    expect(can("OWNER", "billing:manage")).toBe(true);
    expect(can("ADMIN", "billing:manage")).toBe(false);
    expect(can("OPERATOR", "billing:manage")).toBe(false);
    expect(can("VIEWER", "billing:manage")).toBe(false);
  });

  it("VIEWER holds no write permission at all", () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(can("VIEWER", perm)).toBe(false);
    }
  });

  it("an unknown role is denied everything (fails closed)", () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(can("SUPERUSER", perm)).toBe(false);
      expect(can("", perm)).toBe(false);
    }
  });
});

describe("permissionsFor()", () => {
  for (const role of ROLES) {
    it(`${role} resolves to exactly its expected scope`, () => {
      expect([...permissionsFor(role)].sort()).toEqual([...EXPECTED[role]].sort());
    });
  }

  it("returns an empty list for an unknown role", () => {
    expect(permissionsFor("NOPE")).toEqual([]);
  });

  it("ADMIN is a strict superset of OPERATOR", () => {
    const admin = new Set(permissionsFor("ADMIN"));
    for (const p of permissionsFor("OPERATOR")) expect(admin.has(p)).toBe(true);
  });

  it("OWNER is a strict superset of ADMIN", () => {
    const owner = new Set(permissionsFor("OWNER"));
    for (const p of permissionsFor("ADMIN")) expect(owner.has(p)).toBe(true);
  });
});

describe("requirePermission()", () => {
  beforeEach(() => mockedGetContext.mockReset());

  it("returns null when signed out", async () => {
    mockedGetContext.mockResolvedValue(null);
    expect(await requirePermission("orders:write")).toBeNull();
  });

  it("returns the context when the role holds the permission", async () => {
    const ctx = { userId: "u1", businessId: "b1", role: "OPERATOR" };
    mockedGetContext.mockResolvedValue(ctx);
    expect(await requirePermission("orders:write")).toEqual(ctx);
  });

  it("returns null when the role lacks the permission", async () => {
    mockedGetContext.mockResolvedValue({ userId: "u1", businessId: "b1", role: "OPERATOR" });
    expect(await requirePermission("team:manage")).toBeNull();
  });

  it("denied-by-role and signed-out are indistinguishable (both null)", async () => {
    mockedGetContext.mockResolvedValue({ userId: "u1", businessId: "b1", role: "VIEWER" });
    const denied = await requirePermission("products:write");
    mockedGetContext.mockResolvedValue(null);
    const signedOut = await requirePermission("products:write");
    expect(denied).toBe(signedOut);
  });
});
