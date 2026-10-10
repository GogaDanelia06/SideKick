import { describe, it, expect } from "vitest";
import { tokensMatch, verifySignature } from "./meta";
import { SECRET, delivery, message, sign } from "./metaTestKit";

describe("verifySignature()", () => {
  it("accepts a body signed with the app secret", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a body signed with a different secret", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body, "someone-elses-secret"), SECRET)).toBe(false);
  });

  it("rejects a body that was altered after signing", () => {
    const original = delivery([message()]);
    const signature = sign(original);
    const tampered = original.replace("გამარჯობა", "გადმომირიცხე ფული");
    expect(verifySignature(tampered, signature, SECRET)).toBe(false);
  });

  it("rejects a request with no signature at all", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, null, SECRET)).toBe(false);
    expect(verifySignature(body, undefined, SECRET)).toBe(false);
    expect(verifySignature(body, "", SECRET)).toBe(false);
  });

  it("rejects a signature that is not sha256", () => {
    const body = delivery([message()]);
    const md5ish = sign(body).replace("sha256=", "sha1=");
    expect(verifySignature(body, md5ish, SECRET)).toBe(false);
  });

  it("rejects malformed hex instead of throwing", () => {
    const body = delivery([message()]);
    expect(() => verifySignature(body, "sha256=zzzz", SECRET)).not.toThrow();
    expect(verifySignature(body, "sha256=zzzz", SECRET)).toBe(false);
  });

  it("is computed over the exact bytes received, not re-serialised JSON", () => {
    const body = delivery([message()]);
    const signature = sign(body);
    const reserialised = JSON.stringify(JSON.parse(body), null, 2);
    expect(reserialised).not.toBe(body);
    expect(verifySignature(reserialised, signature, SECRET)).toBe(false);
  });
});

describe("tokensMatch()", () => {
  it("accepts the exact token", () => {
    expect(tokensMatch("verify-me-please", "verify-me-please")).toBe(true);
  });

  it("rejects a different or truncated token", () => {
    expect(tokensMatch("verify-me-pleas", "verify-me-please")).toBe(false);
    expect(tokensMatch("VERIFY-ME-PLEASE", "verify-me-please")).toBe(false);
    expect(tokensMatch("", "verify-me-please")).toBe(false);
  });
});

describe("two app secrets", () => {
  const IG_SECRET = "instagram-app-secret";

  it("accepts a body signed with the second secret", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body, IG_SECRET), SECRET, IG_SECRET)).toBe(true);
  });

  it("still accepts one signed with the first", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body), SECRET, IG_SECRET)).toBe(true);
  });

  it("rejects a body signed with neither", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body, "somebody-else"), SECRET, IG_SECRET)).toBe(false);
  });

  it("ignores secrets that are not configured", () => {
    const body = delivery([message()]);
    expect(verifySignature(body, sign(body), undefined, SECRET)).toBe(true);
    expect(verifySignature(body, sign(body), undefined, undefined)).toBe(false);
  });
});
