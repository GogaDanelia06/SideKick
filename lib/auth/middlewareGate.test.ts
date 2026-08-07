import { describe, it, expect } from "vitest";
import { authConfig } from "@/auth.config";

/**
 * The `authorized` callback is what middleware runs before a page is reached.
 * It sees only the session — a snapshot taken at sign-in — which is why the
 * decisions it is allowed to make are so narrow.
 */
const gate = authConfig.callbacks!.authorized!;

const visit = (pathname: string, user?: { isAdmin?: boolean }) =>
  gate({
    auth: user ? ({ user } as never) : null,
    request: { nextUrl: new URL(`https://sidekick.ge${pathname}`) },
  } as never);

describe("middleware gate", () => {
  it("lets a signed-in visitor through to the dashboard", () => {
    expect(visit("/dashboard", {})).toBe(true);
  });

  it("turns a signed-out visitor away from the dashboard", () => {
    expect(visit("/dashboard")).toBe(false);
  });

  it("turns a signed-out visitor away from the admin panel", () => {
    expect(visit("/admin")).toBe(false);
  });

  it("lets an admin whose cookie predates the promotion through", () => {
    // The bug this exists for. Granting someone the flag in the database used
    // to leave them shut out until they happened to sign in again, because the
    // gate read `isAdmin` from a token minted before the change. The database
    // check in the admin layout is what decides now.
    expect(visit("/admin", { isAdmin: false })).toBe(true);
  });

  it("leaves public pages alone", () => {
    expect(visit("/")).toBe(true);
    expect(visit("/pricing")).toBe(true);
    expect(visit("/login")).toBe(true);
  });
});
