import { afterEach, describe, expect, it, vi } from "vitest";
import { authorizeUrl, IG_SCOPES } from "./instagramLogin";
import { fetchAccount, subscribeToMessages } from "./instagramAccount";

const ok = (body: unknown) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe("authorizeUrl()", () => {
  it("sends the merchant to instagram.com, not facebook.com", () => {
    // The whole bug this flow replaces: Facebook's dialog does not know these
    // scopes, so the account silently never grants message access.
    expect(authorizeUrl("APP_1", "https://sidekick.ge/cb", "STATE")).toContain(
      "https://www.instagram.com/oauth/authorize",
    );
  });

  it("asks for the two scopes Meta requires before it will deliver a DM", () => {
    const url = new URL(authorizeUrl("APP_1", "https://sidekick.ge/cb", "STATE"));
    expect(url.searchParams.get("scope")).toBe(IG_SCOPES);
    expect(IG_SCOPES).toContain("instagram_business_manage_messages");
  });

  it("carries the client id, redirect and state through unchanged", () => {
    const url = new URL(authorizeUrl("APP_1", "https://sidekick.ge/cb", "STATE"));
    expect(url.searchParams.get("client_id")).toBe("APP_1");
    expect(url.searchParams.get("redirect_uri")).toBe("https://sidekick.ge/cb");
    expect(url.searchParams.get("state")).toBe("STATE");
  });

  it("forces a fresh sign-in", () => {
    // Without this, whichever Instagram account the browser is already signed
    // into is the one that gets connected — silently, and often the wrong one.
    const url = new URL(authorizeUrl("APP_1", "https://sidekick.ge/cb", "STATE"));
    expect(url.searchParams.get("force_reauth")).toBe("true");
  });
});

describe("fetchAccount()", () => {
  it("stores user_id, not id", async () => {
    // Both come back from the same call. Only user_id matches the `entry.id`
    // Meta puts on an incoming webhook, so picking `id` produces a channel that
    // looks connected and drops every message.
    vi.stubGlobal(
      "fetch",
      ok({ user_id: "17841436214263005", username: "sidekickge", id: "27874418322242107" }),
    );

    await expect(fetchAccount("IGA_TOKEN")).resolves.toEqual({
      id: "17841436214263005",
      username: "sidekickge",
    });
  });

  it("refuses a numeric user_id rather than storing a rounded one", async () => {
    // These ids are past 2^53. JSON.parse turns 17841436214263005 into
    // …004 before this code ever sees it, so an id that arrives unquoted is
    // already wrong and would match no webhook. Failing loudly beats a channel
    // that looks connected and silently drops every message.
    vi.stubGlobal("fetch", ok({ user_id: 17841436214263005, username: "x" }));
    await expect(fetchAccount("IGA_TOKEN")).resolves.toBeNull();
  });

  it("returns null when Meta answers with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "Invalid OAuth access token" } }),
      }),
    );
    await expect(fetchAccount("BAD")).resolves.toBeNull();
  });
});

describe("subscribeToMessages()", () => {
  it("POSTs to subscribed_apps with the messages field", async () => {
    const fetchMock = ok({ success: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(subscribeToMessages("IGA_TOKEN")).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/me/subscribed_apps");
    expect(String(url)).toContain("subscribed_fields=messages");
    expect(init.method).toBe("POST");
  });

  it("is false when Meta does not confirm, so connect can report it", async () => {
    vi.stubGlobal("fetch", ok({ success: false }));
    await expect(subscribeToMessages("IGA_TOKEN")).resolves.toBe(false);
  });
});

describe("cron route authorisation", () => {
  it("refuses when CRON_SECRET is unset rather than defaulting to open", async () => {
    // An unauthenticated job anyone can trigger is worse than one that does not
    // run: it calls Meta on demand for every connected account.
    delete process.env.CRON_SECRET;
    const { GET } = await import("@/app/api/cron/instagram-refresh/route");
    const res = await GET(new Request("https://sidekick.ge/api/cron/instagram-refresh"));
    expect(res.status).toBe(401);
  });

  it("refuses a wrong secret", async () => {
    process.env.CRON_SECRET = "the-real-one";
    const { GET } = await import("@/app/api/cron/instagram-refresh/route");
    const res = await GET(
      new Request("https://sidekick.ge/api/cron/instagram-refresh", {
        headers: { authorization: "Bearer not-it" },
      }),
    );
    expect(res.status).toBe(401);
  });
});
