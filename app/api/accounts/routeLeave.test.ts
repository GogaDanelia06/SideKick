import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", async () => ({ cookies: async () => (await import("./accountsTestJar")).cookieJar() }));

import { POST } from "./route";
import { SESSION, jar, put, request, reset, session, value } from "./accountsTestJar";
import { encodeLabel, labelOf } from "@/lib/auth/accountVault";

const call = (body: unknown, headers?: Record<string, string>) => POST(request(body, headers));

beforeEach(reset);

describe("POST /api/accounts — signing out", () => {
  it("remove: forgets one other account, name and all, and leaves the open one alone", async () => {
    const mine = await session("u1");
    put(SESSION, mine);
    put("sk.acct.1", await session("u2"));
    put(labelOf("sk.acct.1"), encodeLabel({ uid: "u2", name: "Cool Cat", email: "cat@x.ge" }));

    expect((await call({ action: "remove", uid: "u2" })).status).toBe(200);
    expect([...jar.keys()]).toEqual([SESSION]);
    expect(value(SESSION)).toBe(mine);
  });

  it("remove: will not touch the account that is open", async () => {
    put(SESSION, await session("u1"));
    put("sk.acct.1", await session("u1"));
    await call({ action: "remove", uid: "u1" });
    expect(value("sk.acct.1")).toBeDefined();
  });

  it("leave: signs the open account out, opens the next one, and forgets the one that left", async () => {
    put(SESSION, await session("u1"));
    put("sk.acct.1", await session("u1"));
    const theirs = await session("u2", { businessId: "b2" });
    put("sk.acct.2", theirs);

    expect(await (await call({ action: "leave" })).json()).toEqual({ ok: true, next: { isAdmin: false, hasBusiness: true } });
    expect(value(SESSION)).toBe(theirs);
    expect([...jar.keys()]).toEqual([SESSION]);
  });

  it("leave: with nobody else live, the browser is simply signed out", async () => {
    put(SESSION, await session("u1"));
    put(labelOf("sk.acct.1"), encodeLabel({ uid: "u2", name: "Cool Cat", email: "cat@x.ge" }));

    expect(await (await call({ action: "leave" })).json()).toEqual({ ok: true, next: null });
    expect(value(SESSION)).toBeUndefined();
    // The expired account stays listed, to log in to again.
    expect(value(labelOf("sk.acct.1"))).toBeDefined();
  });

  it("clear: forgets every parked account and its name, on logout", async () => {
    put("sk.acct.1", await session("u2"));
    put(labelOf("sk.acct.1"), encodeLabel({ uid: "u2", name: "Cool Cat", email: "cat@x.ge" }));
    put(SESSION, await session("u1"));

    await call({ action: "clear" });
    expect([...jar.keys()]).toEqual([SESSION]);
  });

  it("turns away other sites, other formats and unknown actions", async () => {
    expect((await call({ action: "clear" }, { "sec-fetch-site": "cross-site" })).status).toBe(400);
    expect((await call({ action: "clear" }, { "content-type": "text/plain" })).status).toBe(400);
    expect((await call({ action: "take-over" })).status).toBe(400);
    expect((await call({ action: "add" })).status).toBe(401);
  });
});
