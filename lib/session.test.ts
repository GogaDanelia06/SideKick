import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { membership: { findUnique: vi.fn() } } }));
vi.mock("@/lib/env", () => ({ env: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { getContext } from "./session";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

const session = vi.mocked(auth as unknown as () => Promise<unknown>);
const memberFind = vi.mocked(prisma.membership.findUnique);

const signedIn = {
  user: { id: "u1", businessId: "b1", role: "OWNER" },
};

beforeEach(() => {
  vi.clearAllMocks();
  session.mockResolvedValue(signedIn);
  memberFind.mockResolvedValue({ role: "OWNER" } as never);
});

describe("getContext()", () => {
  it("returns the context for a signed-in member", async () => {
    expect(await getContext()).toEqual({ userId: "u1", businessId: "b1", role: "OWNER" });
  });

  it("refuses a cookie whose membership has been removed", async () => {
    // The hole this closes: sessions are JWTs, believed on their own word, and
    // `remember me` stops the expiry from bounding them. Without this check a
    // fired employee keeps reading the merchant's inbox and answering their
    // customers until they happen to sign out.
    memberFind.mockResolvedValue(null);

    expect(await getContext()).toBeNull();
  });

  it("runs as the role in the database, not the one in the token", async () => {
    // The demotion case. The cookie was minted while they were an admin and
    // still says so; the row says otherwise, and the row wins — otherwise a
    // demoted admin keeps every permission until their cookie expires.
    session.mockResolvedValue({ user: { id: "u1", businessId: "b1", role: "ADMIN" } });
    memberFind.mockResolvedValue({ role: "VIEWER" } as never);

    expect((await getContext())?.role).toBe("VIEWER");
  });

  it("takes the role from the database even when the token names none", async () => {
    session.mockResolvedValue({ user: { id: "u1", businessId: "b1" } });
    memberFind.mockResolvedValue({ role: "OPERATOR" } as never);

    expect((await getContext())?.role).toBe("OPERATOR");
  });

  it("returns null when nobody is signed in", async () => {
    session.mockResolvedValue(null);

    expect(await getContext()).toBeNull();
    expect(memberFind).not.toHaveBeenCalled();
  });

  it("returns null when the session carries no business", async () => {
    session.mockResolvedValue({ user: { id: "u1" } });

    expect(await getContext()).toBeNull();
  });

  it("looks the membership up by the pair, so a token cannot name someone else's business", async () => {
    await getContext();

    expect(memberFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_businessId: { userId: "u1", businessId: "b1" } },
      }),
    );
  });
});

describe("diagnostics", () => {
  it("says why it refused when the membership is gone", async () => {
    // The silent version of this cost an evening: correct password, session
    // issued, every guarded route bouncing to /login with nothing in the logs.
    memberFind.mockResolvedValue(null);

    await getContext();

    expect(vi.mocked(log.warn)).toHaveBeenCalledWith(
      expect.stringContaining("no membership"),
      expect.objectContaining({ userId: "u1", businessId: "b1" }),
    );
  });

  it("stays quiet for a visitor who is simply signed out", async () => {
    // Not a fault and not rare — logging it would bury the real refusals.
    session.mockResolvedValue(null);

    await getContext();

    expect(vi.mocked(log.warn)).not.toHaveBeenCalled();
    expect(vi.mocked(log.info)).not.toHaveBeenCalled();
  });
});
