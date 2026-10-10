import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma: { channel: { updateMany: vi.fn() } } }));
vi.mock("@/lib/auth/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));

import { disconnectChannel, setChannelConnected } from "./channels";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { checkLimit } from "@/lib/billing/limits";

const update = vi.mocked(prisma.channel.updateMany);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requirePermission).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" } as never);
  vi.mocked(checkLimit).mockResolvedValue({ allowed: true });
});

describe("disconnectChannel()", () => {
  it("lets the account go, so another business can connect it", async () => {
    expect(await disconnectChannel("ch1")).toEqual({ ok: true });

    expect(update).toHaveBeenCalledWith({
      where: { id: "ch1", businessId: "b1" },
      data: { connected: false, status: "OFF", externalId: null, accessToken: null, tokenExpiresAt: null, lastSyncAt: null },
    });
  });

  it("only ever touches a channel of the business the person is working in", async () => {
    await disconnectChannel("someone-elses");

    expect(update.mock.calls[0][0]?.where).toMatchObject({ businessId: "b1" });
  });

  it("refuses without permission, and changes nothing", async () => {
    vi.mocked(requirePermission).mockResolvedValue(null as never);

    expect(await disconnectChannel("ch1")).toEqual({ ok: false, error: "forbidden" });
    expect(update).not.toHaveBeenCalled();
  });
});

describe("setChannelConnected()", () => {
  it("switches off without letting the account go", async () => {
    await setChannelConnected("ch1", false);

    const data = update.mock.calls[0][0]?.data as Record<string, unknown>;
    expect(data).toMatchObject({ connected: false, status: "OFF" });
    expect(data).not.toHaveProperty("externalId");
    expect(data).not.toHaveProperty("accessToken");
  });
});
