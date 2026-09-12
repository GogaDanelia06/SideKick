import type { PaymentProvider } from "@prisma/client";

export type Locale = "ka" | "en";

export type CheckoutRequest = {
  /** Our own Payment.id — sent to the bank so their callback points back here. */
  paymentId: string;
  /** Whole lari. */
  amount: number;
  currency: string;
  description: string;
  /** Where the customer's browser lands after the bank is done. */
  returnUrl: string;
  /** Where the bank POSTs the result, server to server. */
  callbackUrl: string;
  saveCard: boolean;
  locale: Locale;
};

export type CheckoutSession = {
  /** The bank's id for this payment — BOG order id, TBC payId. */
  providerRef: string;
  /** Where to send the customer's browser. */
  redirectUrl: string;
};

/** What the bank says the payment actually did, read back from its API. */
export type ProviderStatus = {
  state: "paid" | "pending" | "failed";
  /** Set once a card was saved and can be charged again. */
  savedCardRef?: string | null;
  /** Bank's own wording, kept for the failure record. */
  reason?: string | null;
};

/** A bank adapter. Callbacks are only hints: outcomes always come from `fetchStatus`. */
export interface PaymentAdapter {
  readonly key: PaymentProvider;
  /** False when the merchant credentials are not set, so the UI can hide it. */
  isConfigured(): boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  fetchStatus(providerRef: string): Promise<ProviderStatus>;
  /** BOG signs callbacks; TBC does not (returns true), which is why bodies are never trusted. */
  verifyCallback(rawBody: string, headers: Headers): boolean;
  /** Pulls the bank's id for this payment out of its callback body. */
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
