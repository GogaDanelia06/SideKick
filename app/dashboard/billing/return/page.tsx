import Link from "next/link";
import { IconAlertTriangle, IconCircleCheck, IconClock } from "@tabler/icons-react";
import { requireContext } from "@/lib/session";
import { prisma } from "@/lib/db";
import { settlePayment } from "@/lib/billing/checkout";
import { DASH } from "@/lib/dashboard/routes";
import { log } from "@/lib/logger";
import { Panel } from "@/components/dashboard/ui/Panel";
import { BiText } from "@/components/admin/ui/BiText";
import type { ReactNode } from "react";
import type { Text } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

/** Bank return page. Settles here too (idempotently), since the bank callback may arrive later. */
export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const ctx = await requireContext();
  const { payment: paymentId } = await searchParams;

  const payment = paymentId
    ? await prisma.payment.findFirst({
        // Scoped to the caller's business.
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

  const view: { icon: ReactNode; title: Text; body: Text } =
    status === "PAID"
      ? {
          icon: <IconCircleCheck size={40} className="text-green" />,
          title: "dashboard.billing.return.paymentComplete",
          body: "dashboard.billing.return.body",
        }
      : status === "PENDING"
        ? {
            icon: <IconClock size={40} className="text-amber" />,
            title: "dashboard.billing.return.paymentIsProcessing",
            body: "dashboard.billing.return.body2",
          }
        : {
            icon: <IconAlertTriangle size={40} className="text-red" />,
            title: "dashboard.billing.return.paymentDidNotGo",
            body: "dashboard.billing.return.body3",
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
            <BiText value={"dashboard.billing.return.backToBilling"} />
          </Link>
        </div>
      </Panel>
    </div>
  );
}
