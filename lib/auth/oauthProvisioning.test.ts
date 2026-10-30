import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { plan: { findUnique: vi.fn(), findFirst: vi.fn() }, business: { create: vi.fn() } } }));

import { provisionBusiness } from "@/lib/provision";
import { prisma } from "@/lib/db";

const create = vi.mocked(prisma.business.create);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.plan.findUnique).mockResolvedValue({ id: "plan_basic" } as never);
  create.mockResolvedValue({ id: "biz_1" } as never);
});

describe("provisionBusiness()", () => {
  it("makes the new user the owner", async () => {
    await provisionBusiness("u1", "Goga's business");

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Goga's business",
          memberships: { create: { userId: "u1", role: "OWNER" } },
        }),
      }),
    );
  });

  it("gives the business the four channels", async () => {
    await provisionBusiness("u1", "X");

    const data = create.mock.calls[0][0].data as Record<string, { create?: unknown[] }>;
    expect(data.channels.create).toHaveLength(4);
  });

  it("starts the business with no plan, so it waits for activation", async () => {
    await provisionBusiness("u1", "X");

    const data = create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.subscription).toBeUndefined();
    expect(prisma.plan.findUnique).not.toHaveBeenCalled();
  });
});
