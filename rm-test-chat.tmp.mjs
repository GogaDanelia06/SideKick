// One-off: removes the smoke-test conversation from production.
// Scoped to exactly one customerRef. Messages cascade; a Lead or Order
// pointing at it would block the delete, so those are checked first.
import { PrismaClient } from "@prisma/client";

const REF = "PSID_CHECK_105818";
const p = new PrismaClient();

const conv = await p.conversation.findFirst({
  where: { customerRef: REF },
  select: {
    id: true,
    customerRef: true,
    createdAt: true,
    _count: { select: { messages: true, orders: true } },
    lead: { select: { id: true } },
  },
});

if (!conv) {
  console.log(`no conversation with customerRef ${REF} — nothing to delete.`);
} else {
  console.log("about to delete:", {
    id: conv.id,
    customerRef: conv.customerRef,
    created: conv.createdAt.toISOString(),
    messages: conv._count.messages,
    orders: conv._count.orders,
    lead: Boolean(conv.lead),
  });

  if (conv._count.orders > 0 || conv.lead) {
    console.log("\nrefusing: this chat has a lead or order attached. Not test data — stopping.");
  } else {
    await p.conversation.delete({ where: { id: conv.id } });
    console.log("\ndeleted. remaining conversations:", await p.conversation.count());
  }
}

await p.$disconnect();
