import { NextResponse } from "next/server";
import { adapterFor, parseProvider } from "@/lib/payments";
import { settlePayment } from "@/lib/billing/checkout";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Where the banks report back.
 *
 * This endpoint is public — anyone can POST to it — so it is written to be
 * useless to an attacker: the body is only ever used to learn *which* payment
 * to look at, and the outcome comes from an authenticated call back to the
 * bank. Forging a body gets you a re-check of a real payment, nothing more.
 *
 * It answers 200 in almost every case on purpose. Banks retry non-2xx, and a
 * malformed or unknown callback will never succeed on a retry.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await params;
  const provider = parseProvider(raw);
  if (!provider) return NextResponse.json({ error: "unknown provider" }, { status: 404 });

  const body = await request.text();
  const adapter = adapterFor(provider);

  if (!adapter.verifyCallback(body, request.headers)) {
    log.warn("payment callback failed signature check", { provider });
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const providerRef = adapter.refFromCallback(body);
  if (!providerRef) {
    log.warn("payment callback had no payment reference", { provider });
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await settlePayment(provider, providerRef);
    log.info("payment callback handled", { provider, providerRef, result });
  } catch (err) {
    // The bank's API was unreachable. Retrying is worth it here, so this is the
    // one case that reports a failure and lets the bank call again.
    const errorId = log.error("payment callback could not be settled", err, {
      provider,
      providerRef,
    });
    return NextResponse.json({ error: errorId }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
