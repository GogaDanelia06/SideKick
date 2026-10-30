import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { fetchAccountProfile } from "./accountProfile";

const reply = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

const fetchMock = vi.fn();
const calledUrl = (i = 0) => new URL(String(fetchMock.mock.calls[i][0]));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("fetchAccountProfile()", () => {
  it("reads an Instagram Login account from graph.instagram.com/me", async () => {
    fetchMock.mockReturnValue(
      reply({
        username: "sidekickge",
        name: "SideKick",
        profile_picture_url: "https://scontent.cdninstagram.com/p.jpg",
        followers_count: 1240,
        media_count: 18,
      }),
    );

    const profile = await fetchAccountProfile("INSTAGRAM", "17841436214263005", "IGA-token");

    expect(calledUrl().host).toBe("graph.instagram.com");
    expect(calledUrl().pathname).toMatch(/\/me$/);
    expect(profile).toEqual({
      name: "SideKick",
      username: "sidekickge",
      picture: "https://scontent.cdninstagram.com/p.jpg",
      followers: 1240,
      posts: 18,
      link: "https://www.instagram.com/sidekickge",
    });
  });

  it("reads an Instagram account linked through a Page by its id on graph.facebook.com", async () => {
    fetchMock.mockReturnValue(reply({ username: "shop" }));

    const profile = await fetchAccountProfile("INSTAGRAM", "1784", "EAA-page-token");

    expect(calledUrl().host).toBe("graph.facebook.com");
    expect(calledUrl().pathname).toMatch(/\/1784$/);
    expect(profile?.name).toBe("shop");
  });

  it("reads a Facebook Page with its picture and link", async () => {
    fetchMock.mockReturnValue(
      reply({
        name: "Sidekick.ge",
        link: "https://www.facebook.com/sidekick.ge",
        followers_count: 1,
        picture: { data: { url: "https://scontent.xx.fbcdn.net/p.jpg" } },
      }),
    );

    const profile = await fetchAccountProfile("FACEBOOK", "123", "EAA-page-token");

    expect(profile).toMatchObject({
      name: "Sidekick.ge",
      picture: "https://scontent.xx.fbcdn.net/p.jpg",
      followers: 1,
      posts: null,
      link: "https://www.facebook.com/sidekick.ge",
    });
  });

  it("asks again without the counts when Meta refuses the first set of fields", async () => {
    fetchMock
      .mockReturnValueOnce(reply({ error: { code: 10, message: "permission" } }, 400))
      .mockReturnValueOnce(reply({ name: "Sidekick.ge" }));

    const profile = await fetchAccountProfile("FACEBOOK", "123", "EAA-page-token");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calledUrl(1).searchParams.get("fields")).not.toContain("followers_count");
    expect(profile).toMatchObject({ name: "Sidekick.ge", link: "https://www.facebook.com/123" });
  });

  it("does not ask twice when Meta cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));

    expect(await fetchAccountProfile("FACEBOOK", "123", "EAA-page-token")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops links and pictures that are not https", async () => {
    fetchMock.mockReturnValue(
      reply({ name: "Page", link: "javascript:alert(1)", picture: { data: { url: "http://x/p.jpg" } } }),
    );

    const profile = await fetchAccountProfile("FACEBOOK", "123", "EAA-page-token");

    expect(profile).toMatchObject({ picture: null, link: "https://www.facebook.com/123" });
  });

  it("returns nothing for channels that have no Meta account", async () => {
    expect(await fetchAccountProfile("WHATSAPP", "1", "token")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
