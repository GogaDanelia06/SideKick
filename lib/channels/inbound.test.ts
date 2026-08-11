import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    channel: { findUnique: vi.fn() },
    conversation: {
      upsert: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    message: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

import { recordInbound } from "./inbound";
import { prisma } from "@/lib/db";
import type { InboundMessage } from "./meta";

const channelFind = vi.mocked(prisma.channel.findUnique);
const convUpsert = vi.mocked(prisma.conversation.upsert);
const convUpdateMany = vi.mocked(prisma.conversation.updateMany);
const msgFind = vi.mocked(prisma.message.findUnique);
const msgCreate = vi.mocked(prisma.message.create);

const MSG: InboundMessage = {
  pageId: "PAGE_1",
  senderId: "PSID_1",
  text: "გამარჯობა",
  externalId: "mid_1",
  platform: "page",
};

const connectedChannel = { id: "ch1", businessId: "b1", connected: true };

beforeEach(() => {
  vi.clearAllMocks();
  convUpsert.mockResolvedValue({ id: "conv1", customerName: null } as never);
  convUpdateMany.mockResolvedValue({ count: 1 } as never);
  msgFind.mockResolvedValue(null);
  msgCreate.mockResolvedValue({ id: "m1" } as never);
});

describe("recordInbound()", () => {
  it("routes a message to the tenant that owns the page", async () => {
    channelFind.mockResolvedValue(connectedChannel as never);

    const result = await recordInbound("FACEBOOK", MSG);

    expect(result).toEqual({
      businessId: "b1",
      channel: "FACEBOOK",
      conversationId: "conv1",
      messageId: "m1",
      isNew: true,
      needsName: true,
    });
    expect(channelFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { type_externalId: { type: "FACEBOOK", externalId: "PAGE_1" } },
      }),
    );
  });

  it("finds the chat by the customer's PSID so a second message joins the first", async () => {
    channelFind.mockResolvedValue(connectedChannel as never);
    await recordInbound("FACEBOOK", MSG);

    expect(convUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId_customerRef: { businessId: "b1", customerRef: "PSID_1" } },
      }),
    );
  });

  it("stores the message as CUSTOMER, carrying Meta's mid", async () => {
    channelFind.mockResolvedValue(connectedChannel as never);
    await recordInbound("FACEBOOK", MSG);

    expect(msgCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          conversationId: "conv1",
          sender: "CUSTOMER",
          text: "გამარჯობა",
          externalId: "mid_1",
        },
      }),
    );
  });

  it("ignores a page nobody has connected", async () => {
    channelFind.mockResolvedValue(null);

    expect(await recordInbound("FACEBOOK", MSG)).toBeNull();
    expect(msgCreate).not.toHaveBeenCalled();
  });

  it("ignores a channel the tenant has switched off", async () => {
    channelFind.mockResolvedValue({ ...connectedChannel, connected: false } as never);

    expect(await recordInbound("FACEBOOK", MSG)).toBeNull();
    expect(msgCreate).not.toHaveBeenCalled();
  });

  it("does not store a second copy when Meta re-sends the same message", async () => {
    // The retry path. Meta re-sends whenever it misses a 200 inside five
    // seconds, and a duplicate here means the tenant sees the question twice
    // and the AI answers it twice.
    channelFind.mockResolvedValue(connectedChannel as never);
    msgFind.mockResolvedValue({ id: "m1" } as never);

    const result = await recordInbound("FACEBOOK", MSG);

    expect(result).toEqual({
      businessId: "b1",
      channel: "FACEBOOK",
      conversationId: "conv1",
      messageId: "m1",
      isNew: false,
      needsName: true,
    });
    expect(msgCreate).not.toHaveBeenCalled();
  });

  it("defers to the winner when two retries race the unique index", async () => {
    channelFind.mockResolvedValue(connectedChannel as never);
    msgCreate.mockRejectedValue(new Error("Unique constraint failed"));
    msgFind.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "winner" } as never);

    const result = await recordInbound("FACEBOOK", MSG);

    expect(result?.messageId).toBe("winner");
    expect(result?.isNew).toBe(false);
  });

  it("moves a NEW chat to ACTIVE but leaves a DONE one closed", async () => {
    channelFind.mockResolvedValue(connectedChannel as never);
    await recordInbound("FACEBOOK", MSG);

    expect(convUpdateMany).toHaveBeenCalledWith({
      where: { id: "conv1", status: "NEW" },
      data: { status: "ACTIVE" },
    });
  });
});
