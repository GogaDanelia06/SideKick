import { describe, it, expect, vi, beforeEach } from "vitest";
import { encode } from "next-auth/jwt";
import { activeToken, cookieOptions, encodeLabel, otherAccounts, readSession, readVault, sessionCookieName, slotFor } from "./accountVault";

const SECRET = "test-secret-for-the-account-vault-0123456789";
const SALT = "authjs.session-token";
const hour = 60 * 60 * 1000;

const token = (claims: Record<string, unknown>, salt = SALT) =>
  encode({ token: { startedAt: Date.now(), remember: true, ...claims }, secret: SECRET, salt, maxAge: 3600 });

beforeEach(() => vi.stubEnv("AUTH_SECRET", SECRET));

describe("sessionCookieName()", () => {
  it("follows the cookie present, chunked or not, and otherwise the protocol", () => {
    expect(sessionCookieName([{ name: "__Secure-authjs.session-token.1", value: "" }], false)).toBe("__Secure-authjs.session-token");
    expect(sessionCookieName([], true)).toBe("__Secure-authjs.session-token");
    expect(sessionCookieName([], false)).toBe("authjs.session-token");
  });
});

describe("activeToken()", () => {
  it("rejoins a token Auth.js split, in order", () => {
    const chunks = [{ name: `${SALT}.1`, value: "world" }, { name: `${SALT}.0`, value: "hello " }];
    expect(activeToken(chunks, SALT)).toBe("hello world");
    expect(activeToken([{ name: SALT, value: "whole" }], SALT)).toBe("whole");
    expect(activeToken([], SALT)).toBeNull();
  });
});

describe("readSession()", () => {
  it("opens a token of ours", async () => {
    expect(await readSession(await token({ uid: "u1", email: "a@x.ge" }), SALT)).toMatchObject({ uid: "u1" });
  });

  it("refuses forged, foreign and outlived tokens", async () => {
    expect(await readSession("not.a.token", SALT)).toBeNull();
    expect(await readSession(await token({ uid: "u1" }, "another-cookie"), SALT)).toBeNull();
    expect(await readSession(await token({ uid: "u1", remember: false, startedAt: Date.now() - 9 * hour }), SALT)).toBeNull();
    expect(await readSession(await token({ email: "no uid" }), SALT)).toBeNull();
  });
});

describe("the vault", () => {
  it("lists everyone once: a live session wins, a slot with only a label reads as expired", async () => {
    const cookies = [
      { name: "sk.acct.1", value: await token({ uid: "u2", name: " Mariam ", email: "m@x.ge" }) },
      { name: "sk.acct.2", value: "past its time" },
      { name: "sk.acct.2.who", value: encodeLabel({ uid: "u4", name: "Cool Cat", email: "cat@x.ge" }) },
      { name: "sk.acct.3", value: await token({ uid: "u1", email: "me@x.ge" }) },
      { name: "sk.acct.4", value: await token({ uid: "u2", email: "m@x.ge" }) },
    ];
    const entries = await readVault(cookies, SALT);
    expect(entries.map((e) => [e.slot, e.uid, e.expired])).toEqual([
      ["sk.acct.1", "u2", false],
      ["sk.acct.2", "u4", true],
      ["sk.acct.3", "u1", false],
      ["sk.acct.4", "u2", false],
    ]);
    expect(otherAccounts(entries, "u1")).toEqual([
      { uid: "u2", name: "Mariam", email: "m@x.ge", expired: false },
      { uid: "u4", name: "Cool Cat", email: "cat@x.ge", expired: true },
    ]);
  });

  it("ignores a label that has been tampered with", async () => {
    expect(await readVault([{ name: "sk.acct.1.who", value: "not base64 json" }], SALT)).toEqual([]);
  });

  it("parks a person in their own slot, else an empty one, else over an expired account", async () => {
    const entries = await readVault(
      [
        { name: "sk.acct.1", value: await token({ uid: "u2", email: "m@x.ge" }) },
        { name: "sk.acct.2.who", value: encodeLabel({ uid: "u4", name: "Cool Cat", email: "cat@x.ge" }) },
      ],
      SALT,
    );
    expect(slotFor(entries, "u2")).toBe("sk.acct.1");
    expect(slotFor(entries, "u9")).toBe("sk.acct.3");
    const full = [...entries, ...(await readVault([], SALT))];
    expect(slotFor(full.concat({ slot: "sk.acct.3", uid: "a", name: "a", email: "a", expired: false }, { slot: "sk.acct.4", uid: "b", name: "b", email: "b", expired: false }), "u9")).toBe("sk.acct.2");
  });

  it("keeps a remembered account until its token expires, and any other only for this browser session", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    expect(cookieOptions({ remember: true, exp }, true)).toMatchObject({ expires: new Date(exp * 1000), secure: true, httpOnly: true });
    expect(cookieOptions({ remember: false, exp }, false)).not.toHaveProperty("expires");
  });
});
