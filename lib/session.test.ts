import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock("@/lib/env", () => ({ env: vi.fn() }));

import { getContext } from "./session";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const session = vi.mocked(auth as unknown as () => Promise<unknown>);
const userFind = vi.mocked(prisma.user.findUnique);

const signedIn = {
  user: { id: "u1", businessId: "b1", role: "OWNER" },
};

beforeEach(() => {
  vi.clearAllMocks();
  session.mockResolvedValue(signedIn);
  userFind.mockResolvedValue({ id: "u1" } as never);
});

describe("getContext()", () => {
  it("returns the context for a signed-in user who still exists", async () => {
    expect(await getContext()).toEqual({ userId: "u1", businessId: "b1", role: "OWNER" });
  });

  it("refuses a cookie naming an account that has been deleted", async () => {
    // The hole this closes: sessions are JWTs, believed on their own word for a
    // week. Without this check a removed user keeps opening the dashboard until
    // the cookie expires by itself — and the pages fail one query at a time
    // rather than sending them to the login screen.
    userFind.mockResolvedValue(null);

    expect(await getContext()).toBeNull();
  });

  it("returns null when nobody is signed in", async () => {
    session.mockResolvedValue(null);

    expect(await getContext()).toBeNull();
    expect(userFind).not.toHaveBeenCalled();
  });

  it("returns null when the session carries no business", async () => {
    session.mockResolvedValue({ user: { id: "u1" } });

    expect(await getContext()).toBeNull();
  });

  it("falls back to the least privilege when the session names no role", async () => {
    session.mockResolvedValue({ user: { id: "u1", businessId: "b1" } });

    expect((await getContext())?.role).toBe("VIEWER");
  });
});
