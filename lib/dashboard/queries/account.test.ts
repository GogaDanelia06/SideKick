import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(async () => ({ name: "Nino", email: "nino@example.com", isAdmin: false })) },
    subscription: { findUnique: vi.fn(async () => null) },
    membership: {
      findMany: vi.fn(async () => [
        { role: "OWNER", business: { id: "b1", name: "Flower shop" } },
        { role: "OPERATOR", business: { id: "b2", name: "Bakery" } },
      ]),
    },
  },
}));

import { getAccount } from "./account";
import { prisma } from "@/lib/db";

describe("getAccount()", () => {
  it("lists every business of the user, oldest first, with their role in each", async () => {
    const account = await getAccount("u1", "b2");

    expect(account).toMatchObject({ name: "Nino", initial: "N", planName: null, businessId: "b2" });
    expect(account.businesses).toEqual([
      { id: "b1", name: "Flower shop", role: "OWNER" },
      { id: "b2", name: "Bakery", role: "OPERATOR" },
    ]);
    expect(prisma.membership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1" }, orderBy: { createdAt: "asc" } }),
    );
  });
});
