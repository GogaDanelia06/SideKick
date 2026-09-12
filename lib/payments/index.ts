import type { PaymentProvider } from "@prisma/client";
import { bog } from "./bog";
import { tbc } from "./tbc";
import type { PaymentAdapter } from "./types";

const ADAPTERS: Record<PaymentProvider, PaymentAdapter> = { BOG: bog, TBC: tbc };

export function adapterFor(provider: PaymentProvider): PaymentAdapter {
  return ADAPTERS[provider];
}

/** Narrows an untrusted string (a URL segment) to a known provider. */
export function parseProvider(value: string): PaymentProvider | null {
  const upper = value.toUpperCase();
  return upper === "BOG" || upper === "TBC" ? upper : null;
}

/** Banks whose merchant credentials are configured; only these are offered. */
export function availableProviders(): PaymentProvider[] {
  return (Object.keys(ADAPTERS) as PaymentProvider[]).filter((k) => ADAPTERS[k].isConfigured());
}

export type { CheckoutRequest, CheckoutSession, PaymentAdapter, ProviderStatus } from "./types";
export { PaymentError } from "./types";
