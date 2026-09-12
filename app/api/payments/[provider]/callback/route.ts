import { NextResponse } from "next/server";
import { adapterFor, parseProvider } from "@/lib/payments";
import { settlePayment } from "@/lib/billing/checkout";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Bank payment callbacks. The body only identifies the payment; its status is read
 * back from the bank. Answers 200 unless the bank is unreachable, so only that retries.
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
    const errorId = log.error("payment callback could not be settled", err, {
      provider,
      providerRef,
    });
    return NextResponse.json({ error: errorId }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
