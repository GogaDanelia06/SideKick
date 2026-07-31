import Link from "next/link";
import { IconAlertTriangle, IconCircleCheck, IconClock } from "@tabler/icons-react";
import { requireContext } from "@/lib/session";
import { prisma } from "@/lib/db";
import { settlePayment } from "@/lib/billing/checkout";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { Panel } from "@/components/dashboard/ui/Panel";
import { BiText } from "@/components/admin/ui/BiText";

export const dynamic = "force-dynamic";

/**
 * Where the bank sends the customer back to.
 *
 * The bank's callback is what really settles a payment, but it can arrive after
 * the customer is already looking at this page — so we settle here too. Both
 * paths funnel through the same idempotent `settlePayment`, so whichever wins
 * the race, the subscription is extended exactly once.
 */
export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const ctx = await requireContext();
  const { payment: paymentId } = await searchParams;

  const payment = paymentId
    ? await prisma.payment.findFirst({
        // Scoped to the caller's business: a payment id in the URL must not
        // reveal another tenant's billing.
        where: { id: paymentId, businessId: ctx.businessId },
      })
    : null;

  let status = payment?.status ?? null;

  if (payment?.status === "PENDING" && payment.provider && payment.providerRef) {
    try {
      const settled = await settlePayment(payment.provider, payment.providerRef);
      status = settled === "paid" ? "PAID" : settled === "failed" ? "FAILED" : "PENDING";
    } catch (err) {
      log.error("could not settle payment on return", err, { paymentId: payment.id });
    }
  }

  const view =
    status === "PAID"
      ? {
          icon: <IconCircleCheck size={40} className="text-green" />,
          title: { ka: "გადახდა შესრულდა", en: "Payment complete" },
          body: {
            ka: "პაკეტი გააქტიურდა. მადლობა!",
            en: "Your plan is active. Thank you!",
          },
        }
      : status === "PENDING"
        ? {
            icon: <IconClock size={40} className="text-amber" />,
            title: { ka: "გადახდა მუშავდება", en: "Payment is processing" },
            body: {
              ka: "ბანკი ჯერ ამუშავებს გადახდას. ეს ჩვეულებრივ რამდენიმე წამია — განაახლეთ გვერდი ცოტა ხანში.",
              en: "The bank is still processing. This usually takes a few seconds — refresh shortly.",
            },
          }
        : {
            icon: <IconAlertTriangle size={40} className="text-red" />,
            title: { ka: "გადახდა ვერ შესრულდა", en: "Payment did not go through" },
            body: {
              ka: "თანხა არ ჩამოგეჭრათ. სცადეთ ხელახლა ან აირჩიეთ სხვა ბანკი.",
              en: "You have not been charged. Try again or pick the other bank.",
            },
          };

  return (
    <div className="mx-auto max-w-[520px]">
      <Panel className="px-6 py-10 text-center">
        <div className="mb-4 flex justify-center">{view.icon}</div>
        <BiText as="h1" className="text-lg font-semibold" value={view.title} />
        <BiText as="p" className="mt-2 text-sm text-muted" value={view.body} />

        {payment ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-border bg-soft px-3.5 py-2 text-[13px]">
            <span className="text-muted">{payment.description}</span>
            <span className="font-mono font-semibold">{payment.amount}₾</span>
          </div>
        ) : null}

        <div className="mt-6">
          <Link
            href={DASH.billing}
            className="inline-flex h-10 items-center rounded-[8px] bg-primary px-5 text-[13px] font-medium text-white"
          >
            <BiText value={{ ka: "ბილინგზე დაბრუნება", en: "Back to billing" }} />
          </Link>
        </div>
      </Panel>
    </div>
  );
}
