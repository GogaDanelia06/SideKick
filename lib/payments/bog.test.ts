import { describe, it, expect } from "vitest";
import { createSign, generateKeyPairSync } from "node:crypto";
import { bog } from "./bog";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PUBLIC_PEM = publicKey.export({ type: "spki", format: "pem" }).toString();

function sign(body: string): string {
  return createSign("SHA256").update(body).sign(privateKey).toString("base64");
}

function headers(signature?: string): Headers {
  const h = new Headers();
  if (signature !== undefined) h.set("Callback-Signature", signature);
  return h;
}

describe("bog.verifyCallback", () => {
  const body = JSON.stringify({ event: "order_payment", body: { order_id: "abc-123" } });

  it("accepts a body signed with the matching key", () => {
    process.env.BOG_PUBLIC_KEY = PUBLIC_PEM;
    expect(bog.verifyCallback(body, headers(sign(body)))).toBe(true);
  });

  it("rejects a body that was altered after signing", () => {
    process.env.BOG_PUBLIC_KEY = PUBLIC_PEM;
    const signature = sign(body);
    const tampered = JSON.stringify({ event: "order_payment", body: { order_id: "evil" } });
    expect(bog.verifyCallback(tampered, headers(signature))).toBe(false);
  });

  it("rejects a callback with no signature header", () => {
    process.env.BOG_PUBLIC_KEY = PUBLIC_PEM;
    expect(bog.verifyCallback(body, headers())).toBe(false);
  });

  it("rejects a signature that is not valid base64 for this key", () => {
    process.env.BOG_PUBLIC_KEY = PUBLIC_PEM;
    expect(bog.verifyCallback(body, headers("not-a-signature"))).toBe(false);
  });

  it("rejects when signed by a different key", () => {
    const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
    process.env.BOG_PUBLIC_KEY = other.publicKey.export({ type: "spki", format: "pem" }).toString();
    expect(bog.verifyCallback(body, headers(sign(body)))).toBe(false);
  });

  it("does not throw when the configured key is malformed", () => {
    process.env.BOG_PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nnonsense\n-----END PUBLIC KEY-----";
    expect(bog.verifyCallback(body, headers(sign(body)))).toBe(false);
  });
});

describe("bog.refFromCallback", () => {
  it("reads order_id out of the callback body", () => {
    const body = JSON.stringify({ event: "order_payment", body: { order_id: "ord-9" } });
    expect(bog.refFromCallback(body)).toBe("ord-9");
  });

  it("returns null for a body with no order id", () => {
    expect(bog.refFromCallback(JSON.stringify({ event: "order_payment" }))).toBeNull();
  });

  it("returns null rather than throwing on invalid JSON", () => {
    expect(bog.refFromCallback("<html>error</html>")).toBeNull();
  });
});

describe("bog.isConfigured", () => {
  it("is false while credentials are missing", () => {
    delete process.env.BOG_CLIENT_ID;
    delete process.env.BOG_CLIENT_SECRET;
    expect(bog.isConfigured()).toBe(false);
  });

  it("is true once both credentials are set", () => {
    process.env.BOG_CLIENT_ID = "id";
    process.env.BOG_CLIENT_SECRET = "secret";
    expect(bog.isConfigured()).toBe(true);
  });
});
