import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findUnique: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { nameCustomer } from "./profile";
import { prisma } from "@/lib/db";

const convFind = vi.mocked(prisma.conversation.findUnique);
const convUpdate = vi.mocked(prisma.conversation.updateMany);

const conversation = (over: Record<string, unknown> = {}) =>
  ({
    customerRef: "PSID_1",
    customerName: null,
    channel: { type: "FACEBOOK", accessToken: "page-token" },
    ...over,
  }) as never;

/** Meta's reply, and what the fetch mock hands back. */
function graph(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: async () => body });
}

beforeEach(() => {
  vi.clearAllMocks();
  convFind.mockResolvedValue(conversation());
  convUpdate.mockResolvedValue({ count: 1 } as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("nameCustomer()", () => {
  it("joins the two halves of a Facebook name", async () => {
    vi.stubGlobal("fetch", graph({ first_name: "ლიკა", last_name: "ბერიძე" }));
    await nameCustomer("conv1");

    expect(convUpdate).toHaveBeenCalledWith({
      where: { id: "conv1", customerName: null },
      data: { customerName: "ლიკა ბერიძე" },
    });
  });

  it("asks each surface for the fields it actually has", async () => {
    const fetchMock = graph({ name: "Lika" });
    vi.stubGlobal("fetch", fetchMock);
    convFind.mockResolvedValue(
      conversation({ channel: { type: "INSTAGRAM", accessToken: "page-token" } }),
    );
    await nameCustomer("conv1");

    // Asking Facebook's fields of an Instagram id is an error, not an empty
    // answer, so the wrong one here means every Instagram chat stays a dash.
    expect(String(fetchMock.mock.calls[0][0])).toContain("fields=name,username");
  });

  it("falls back to the Instagram handle when there is no display name", async () => {
    vi.stubGlobal("fetch", graph({ username: "lika_ge" }));
    convFind.mockResolvedValue(
      conversation({ channel: { type: "INSTAGRAM", accessToken: "page-token" } }),
    );
    await nameCustomer("conv1");

    expect(convUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { customerName: "lika_ge" } }),
    );
  });

  it("leaves a name somebody already set alone", async () => {
    // The merchant's own word for their customer beats Facebook's.
    const fetchMock = graph({ first_name: "Lika" });
    vi.stubGlobal("fetch", fetchMock);
    convFind.mockResolvedValue(conversation({ customerName: "ლიკა — მუდმივი კლიენტი" }));
    await nameCustomer("conv1");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(convUpdate).not.toHaveBeenCalled();
  });

  it("does nothing when the channel has no token yet", async () => {
    const fetchMock = graph({});
    vi.stubGlobal("fetch", fetchMock);
    convFind.mockResolvedValue(
      conversation({ channel: { type: "FACEBOOK", accessToken: null } }),
    );
    await nameCustomer("conv1");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("writes nothing when Meta refuses the profile", async () => {
    // Deleted accounts and undisclosed profiles are ordinary. The message is
    // already stored and answerable; only the label is missing.
    vi.stubGlobal("fetch", graph({ error: { message: "Unsupported get request" } }, false));
    await nameCustomer("conv1");

    expect(convUpdate).not.toHaveBeenCalled();
  });

  it("survives the request failing outright", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network is down")));

    await expect(nameCustomer("conv1")).resolves.toBeUndefined();
    expect(convUpdate).not.toHaveBeenCalled();
  });
});
