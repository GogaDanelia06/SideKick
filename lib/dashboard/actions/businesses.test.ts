import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ unstable_update: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { membership: { count: vi.fn() } } }));
vi.mock("@/lib/provision", () => ({ provisionBusiness: vi.fn() }));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { info: vi.fn(), error: vi.fn() } }));

import { addBusiness, switchBusiness } from "./businesses";
import { unstable_update } from "@/auth";
import { prisma } from "@/lib/db";
import { provisionBusiness } from "@/lib/provision";
import { getContext } from "@/lib/session";

const update = vi.mocked(unstable_update);
const provision = vi.mocked(provisionBusiness);
const owned = vi.mocked(prisma.membership.count);

/** What Auth.js answers once the jwt callback has run: the session is now in `businessId`. */
const landsIn = (businessId: string) => update.mockResolvedValue({ user: { id: "u1", businessId }, expires: "" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" });
  owned.mockResolvedValue(1);
  provision.mockResolvedValue({ id: "b9" } as never);
});

describe("switchBusiness()", () => {
  it("asks for the business and reports whether the session really moved", async () => {
    landsIn("b2");
    expect(await switchBusiness("b2")).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ user: { businessId: "b2" } });

    // The jwt callback refused a business the user is not in, so the session stayed in b1.
    landsIn("b1");
    expect(await switchBusiness("b3")).toEqual({ ok: false });
  });

  it("refuses without a signed-in session or a business id", async () => {
    expect(await switchBusiness("")).toEqual({ ok: false });
    expect(await switchBusiness(7 as never)).toEqual({ ok: false });
    vi.mocked(getContext).mockResolvedValue(null);
    expect(await switchBusiness("b2")).toEqual({ ok: false });
    expect(update).not.toHaveBeenCalled();
  });

  it("reports a failure instead of throwing", async () => {
    update.mockRejectedValue(new Error("down"));
    expect(await switchBusiness("b2")).toEqual({ ok: false });
  });
});

describe("addBusiness()", () => {
  it("creates the business for the caller under the trimmed name, and opens it", async () => {
    landsIn("b9");
    expect(await addBusiness("  Flower shop ")).toEqual({ ok: true });
    expect(provision).toHaveBeenCalledWith("u1", "Flower shop");
    expect(update).toHaveBeenCalledWith({ user: { businessId: "b9" } });
  });

  it("still succeeds when only opening the new business fails", async () => {
    update.mockRejectedValue(new Error("down"));
    expect(await addBusiness("Flower shop")).toEqual({ ok: true });
  });

  it("needs a name of at most 120 characters", async () => {
    for (const name of ["", "   ", "x".repeat(121), 5 as never]) {
      expect(await addBusiness(name)).toEqual({ ok: false, error: "name" });
    }
    expect(provision).not.toHaveBeenCalled();
  });

  it("stops at five owned businesses", async () => {
    owned.mockResolvedValue(5);
    expect(await addBusiness("Sixth")).toEqual({ ok: false, error: "limit" });
    expect(owned).toHaveBeenCalledWith({ where: { userId: "u1", role: "OWNER" } });
    expect(provision).not.toHaveBeenCalled();
  });

  it("refuses without a session and reports database failures", async () => {
    provision.mockRejectedValue(new Error("down"));
    expect(await addBusiness("Shop")).toEqual({ ok: false, error: "failed" });
    vi.mocked(getContext).mockResolvedValue(null);
    expect(await addBusiness("Shop")).toEqual({ ok: false, error: "unauthorized" });
  });
});
