import { describe, it, expect, vi, beforeEach } from "vitest";
import { encode } from "next-auth/jwt";

const SECRET = "test-secret-for-the-google-sign-in-0123456789";
const SALT = "__Secure-authjs.session-token";

const browser: { cookies: { name: string; value: string }[] } = { cookies: [] };

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => browser.cookies }),
  headers: async () => ({ get: (key: string) => (key === "x-forwarded-proto" ? "https" : null) }),
}));

const { googleSignInAllowed } = await import("./googleSignIn");

const signedInAs = async (uid: string) => {
  const token = { uid, email: `${uid}@x.ge`, startedAt: Date.now(), remember: true };
  browser.cookies = [{ name: SALT, value: await encode({ token, secret: SECRET, salt: SALT, maxAge: 3600 }) }];
};

const google = { provider: "google" };
const verified = { email_verified: true };

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", SECRET);
  browser.cookies = [];
});

describe("googleSignInAllowed()", () => {
  it("lets the password form through untouched", async () => {
    await signedInAs("u1");
    expect(await googleSignInAllowed({ account: { provider: "credentials" }, user: { id: "u2" } })).toBe(true);
  });

  it("refuses an address Google has not confirmed", async () => {
    expect(await googleSignInAllowed({ account: google, profile: { email_verified: false }, user: { id: "u1" } })).toBe(false);
    expect(await googleSignInAllowed({ account: google, profile: {}, user: { id: "u1" } })).toBe(false);
  });

  it("allows Google when nobody is signed in on this browser", async () => {
    expect(await googleSignInAllowed({ account: google, profile: verified, user: { id: "u1" } })).toBe(true);
  });

  /**
   * The bug this closes: Auth.js links an unclaimed Google account to the open session,
   * for good. One person's Google address then opened somebody else's account for ever.
   */
  it("refuses Google while a different account is open", async () => {
    await signedInAs("u1");
    expect(await googleSignInAllowed({ account: google, profile: verified, user: { id: "u2" } })).toBe(false);
    expect(await googleSignInAllowed({ account: google, profile: verified, user: {} })).toBe(false);
  });

  it("allows signing in again as the account already open", async () => {
    await signedInAs("u1");
    expect(await googleSignInAllowed({ account: google, profile: verified, user: { id: "u1" } })).toBe(true);
  });

  it("ignores a session cookie that is no longer valid", async () => {
    browser.cookies = [{ name: SALT, value: "not a token of ours" }];
    expect(await googleSignInAllowed({ account: google, profile: verified, user: { id: "u2" } })).toBe(true);
  });
});
