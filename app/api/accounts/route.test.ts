import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", async () => ({ cookies: async () => (await import("./accountsTestJar")).cookieJar() }));

import { POST } from "./route";
import { SESSION, put, request, reset, session, value } from "./accountsTestJar";
import { labelOf } from "@/lib/auth/accountVault";

const call = (body: unknown, headers?: Record<string, string>) => POST(request(body, headers));

beforeEach(reset);

describe("POST /api/accounts — adding and switching", () => {
  it("add: parks the open account with its name, and signs the browser out for a clean sign-in", async () => {
    const mine = await session("u1");
    put(SESSION, mine);

    expect((await call({ action: "add" })).status).toBe(200);
    expect(value("sk.acct.1")).toBe(mine);
    // The name and email stay readable after the token expires, for the "session expired" row.
    expect(JSON.parse(Buffer.from(value(labelOf("sk.acct.1"))!, "base64url").toString())).toMatchObject({ uid: "u1" });
    expect(value(SESSION)).toBeUndefined();
  });

  it("add: the same person again replaces their older token, and a sixth account is refused", async () => {
    for (const [slot, uid] of [["sk.acct.1", "u1"], ["sk.acct.2", "u2"], ["sk.acct.3", "u3"], ["sk.acct.4", "u4"]]) {
      put(slot, await session(uid));
    }
    const again = await session("u3");
    put(SESSION, again);
    expect((await call({ action: "add" })).status).toBe(200);
    expect(value("sk.acct.3")).toBe(again);

    put(SESSION, await session("u5"));
    expect(await (await call({ action: "add" })).json()).toEqual({ ok: false, error: "full" });
  });

  it("switch: swaps the parked account in, and the open one takes its slot", async () => {
    const mine = await session("u1");
    const theirs = await session("u2", { isAdmin: true });
    put(SESSION, mine);
    put("sk.acct.1", theirs);

    expect(await (await call({ action: "switch", uid: "u2" })).json()).toEqual({ ok: true, isAdmin: true, hasBusiness: false });
    expect(value(SESSION)).toBe(theirs);
    expect(value("sk.acct.1")).toBe(mine);
  });

  it("switch from the login page, with nothing open, just brings the account back", async () => {
    const theirs = await session("u2", { businessId: "b2" });
    put("sk.acct.2", theirs);

    expect(await (await call({ action: "switch", uid: "u2" })).json()).toMatchObject({ ok: true, hasBusiness: true });
    expect(value(SESSION)).toBe(theirs);
    expect(value("sk.acct.2")).toBeUndefined();
  });

  it("switch: refuses a token it cannot trust, or an account that is not there", async () => {
    put("sk.acct.1", "forged");
    expect((await call({ action: "switch", uid: "u2" })).status).toBe(404);
    expect(value(SESSION)).toBeUndefined();
  });
});
