import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    conversation: { findFirst: vi.fn(), updateMany: vi.fn() },
    message: { create: vi.fn() },
  },
}));
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(),
  can: vi.fn(() => true),
}));
vi.mock("@/lib/channels/send", () => ({ deliverOutbound: vi.fn() }));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/payments", () => ({ availableProviders: vi.fn(() => []), parseProvider: vi.fn() }));
vi.mock("@/lib/billing/checkout", () => ({ isAllowedMonths: vi.fn(), startCheckout: vi.fn() }));
vi.mock("@/lib/billing/limits", () => ({ checkLimit: vi.fn() }));

import { sendOperatorReply } from "./actions/conversations";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { deliverOutbound } from "@/lib/channels/send";

const permit = vi.mocked(requirePermission);
const convFind = vi.mocked(prisma.conversation.findFirst);
const msgCreate = vi.mocked(prisma.message.create);
const deliver = vi.mocked(deliverOutbound);

const CTX = { userId: "u1", businessId: "b1", role: "OWNER" };

beforeEach(() => {
  vi.clearAllMocks();
  permit.mockResolvedValue(CTX as never);
  convFind.mockResolvedValue({ id: "conv1" } as never);
  msgCreate.mockResolvedValue({ id: "m1" } as never);
  vi.mocked(prisma.conversation.updateMany).mockResolvedValue({ count: 1 } as never);
  deliver.mockResolvedValue({ status: "SENT" } as never);
});

describe("sendOperatorReply()", () => {
  it("records the reply as OPERATOR and sends it on", async () => {
    const res = await sendOperatorReply("conv1", "დიახ, გვაქვს");

    expect(res).toEqual({
      ok: true,
      delivery: "SENT",
      message: {
        id: "m1",
        sender: "OPERATOR",
        text: "დიახ, გვაქვს",
        stoppedReason: null,
        timeLabel: expect.stringMatching(/^\d{2}:\d{2}$/),
      },
    });
    expect(msgCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { conversationId: "conv1", sender: "OPERATOR", text: "დიახ, გვაქვს" },
      }),
    );
    expect(deliver).toHaveBeenCalledWith("conv1", "m1", "დიახ, გვაქვს");
  });

  it("looks the conversation up by business as well as id", async () => {
    await sendOperatorReply("conv1", "hi");

    expect(convFind).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "conv1", businessId: "b1" } }),
    );
  });

  it("refuses a conversation that belongs to somebody else", async () => {
    convFind.mockResolvedValue(null);

    expect(await sendOperatorReply("someone-elses", "hi")).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(msgCreate).not.toHaveBeenCalled();
  });

  it("refuses a caller without permission", async () => {
    permit.mockResolvedValue(undefined as never);

    expect(await sendOperatorReply("conv1", "hi")).toEqual({ ok: false, error: "forbidden" });
    expect(msgCreate).not.toHaveBeenCalled();
  });

  it("refuses an empty reply without touching the database", async () => {
    expect(await sendOperatorReply("conv1", "   ")).toEqual({ ok: false, error: "empty" });
    expect(convFind).not.toHaveBeenCalled();
  });

  it("still reports success when the message could not be delivered", async () => {
    deliver.mockResolvedValue({ status: "WINDOW_CLOSED" } as never);

    expect(await sendOperatorReply("conv1", "hi")).toMatchObject({
      ok: true,
      delivery: "WINDOW_CLOSED",
    });
  });

  it("reports null delivery for a channel with nowhere to send", async () => {
    deliver.mockResolvedValue(null);

    expect(await sendOperatorReply("conv1", "hi")).toMatchObject({ ok: true, delivery: null });
  });
});
