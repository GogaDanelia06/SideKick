import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { channel: { findFirst: vi.fn() } } }));
vi.mock("./linkChannel", () => ({ linkChannel: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { connectFromCode } from "./facebookConnect";
import { prisma } from "@/lib/db";
import { linkChannel } from "./linkChannel";

const SIDEKICK = "17841436214263005";
const SOMEBODY_ELSE = "17841417136050617";

const channel = vi.mocked(prisma.channel.findFirst);
const link = vi.mocked(linkChannel);

function metaAnswers(igId: string | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const u = String(url);
      if (u.includes("/oauth/access_token")) {
        return { ok: true, json: async () => ({ access_token: "USER_TOKEN" }) };
      }
      if (u.includes("/me/accounts")) {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "PAGE_1",
                name: "Sidekick",
                access_token: "EAA-page-token",
                ...(igId ? { instagram_business_account: { id: igId } } : {}),
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true }) };
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.META_APP_ID = "APP";
  process.env.META_APP_SECRET = "SECRET";
  link.mockResolvedValue({ ok: true });
  channel.mockResolvedValue(null as never);
});

describe("connectFromCode() carrying Instagram across", () => {
  it("links the Page's Instagram account on the Page token", async () => {
    metaAnswers(SIDEKICK);

    const res = await connectFromCode("b1", "code", "https://sidekick.ge/cb");

    expect(res).toEqual({ ok: true, pageName: "Sidekick", instagram: true });
    expect(link).toHaveBeenCalledWith("b1", "INSTAGRAM", SIDEKICK, "EAA-page-token");
  });

  it("says so when the Page has no Instagram attached", async () => {
    metaAnswers(null);

    const res = await connectFromCode("b1", "code", "https://sidekick.ge/cb");

    expect(res).toMatchObject({ ok: true, instagram: false });
    expect(link).not.toHaveBeenCalledWith("b1", "INSTAGRAM", expect.anything(), expect.anything());
  });

  it("leaves an Instagram Login token for the same account alone", async () => {
    channel.mockResolvedValue({ externalId: SIDEKICK, accessToken: "IGA-good" } as never);
    metaAnswers(SIDEKICK);

    await connectFromCode("b1", "code", "https://sidekick.ge/cb");

    expect(link).not.toHaveBeenCalledWith("b1", "INSTAGRAM", expect.anything(), expect.anything());
  });

  it("replaces an Instagram Login token that names a different account", async () => {
    channel.mockResolvedValue({ externalId: SOMEBODY_ELSE, accessToken: "IGA-wrong" } as never);
    metaAnswers(SIDEKICK);

    await connectFromCode("b1", "code", "https://sidekick.ge/cb");

    expect(link).toHaveBeenCalledWith("b1", "INSTAGRAM", SIDEKICK, "EAA-page-token");
  });
});
