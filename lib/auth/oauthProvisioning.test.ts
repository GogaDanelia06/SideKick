import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { plan: { findUnique: vi.fn() }, business: { create: vi.fn() } } }));

import { provisionBusiness } from "@/lib/provision";
import { prisma } from "@/lib/db";

const create = vi.mocked(prisma.business.create);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.plan.findUnique).mockResolvedValue({ id: "plan_basic" } as never);
  create.mockResolvedValue({ id: "biz_1" } as never);
});

/**
 * The dead end this closes: Google sign-in creates a `User` and nothing else, so
 * without provisioning the account signs in and belongs to no business — and is
 * then bounced off every dashboard route back to the login screen it came from.
 */
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

  it("gives the business the four channels and a trial subscription", async () => {
    // A business with no channel rows has nothing for the channels page to show
    // and nothing for a webhook to route to.
    await provisionBusiness("u1", "X");

    const data = create.mock.calls[0][0].data as Record<string, { create?: unknown[] }>;
    expect(data.channels.create).toHaveLength(4);
    expect(data.subscription).toBeTruthy();
  });

  it("still creates the business when no plan row exists", async () => {
    // A fresh database has no plans. Refusing here would make Google sign-in
    // fail on an install that is otherwise fine.
    vi.mocked(prisma.plan.findUnique).mockResolvedValue(null as never);

    await provisionBusiness("u1", "X");

    const data = create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.subscription).toBeUndefined();
  });
});
