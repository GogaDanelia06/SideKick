import type { PaymentProvider } from "@prisma/client";

export type Locale = "ka" | "en";

export type CheckoutRequest = {
  paymentId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  callbackUrl: string;
  saveCard: boolean;
  locale: Locale;
};

export type CheckoutSession = {
  providerRef: string;
  redirectUrl: string;
};

export type ProviderStatus = {
  state: "paid" | "pending" | "failed";
  savedCardRef?: string | null;
  reason?: string | null;
};

export interface PaymentAdapter {
  readonly key: PaymentProvider;
  isConfigured(): boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  fetchStatus(providerRef: string): Promise<ProviderStatus>;
  verifyCallback(rawBody: string, headers: Headers): boolean;
  refFromCallback(rawBody: string): string | null;
}

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly provider: PaymentProvider,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
