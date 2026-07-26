import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "./logger";

let spies: ReturnType<typeof vi.spyOn>[] = [];
function lastOutput(): string {
  const all = spies.flatMap((s) => s.mock.calls.map((c) => String(c[0])));
  return all.join("\n");
}

beforeEach(() => {
  spies = [
    vi.spyOn(console, "log").mockImplementation(() => {}),
    vi.spyOn(console, "warn").mockImplementation(() => {}),
    vi.spyOn(console, "error").mockImplementation(() => {}),
  ];
});
afterEach(() => vi.restoreAllMocks());

describe("log redaction", () => {
  it("redacts a password field", () => {
    log.info("login attempt", { email: "a@b.com", password: "hunter2" });
    const out = lastOutput();
    expect(out).not.toContain("hunter2");
    expect(out).toContain("[redacted]");
    expect(out).toContain("a@b.com");
  });

  it("redacts a variety of secret-ish keys", () => {
    log.info("blob", {
      token: "tok_abc",
      apiKey: "sk-123",
      authorization: "Bearer xyz",
      cookie: "session=1",
      cardNumber: "4111111111111111",
      secret: "s3cr3t",
    });
    const out = lastOutput();
    for (const leaked of ["tok_abc", "sk-123", "Bearer xyz", "session=1", "4111111111111111", "s3cr3t"]) {
      expect(out).not.toContain(leaked);
    }
  });

  it("matches secret keys regardless of case or separators", () => {
    log.info("blob", { PassWord: "p1", api_key: "p2", "token-hash": "p3" });
    const out = lastOutput();
    expect(out).not.toContain("p1");
    expect(out).not.toContain("p2");
    expect(out).not.toContain("p3");
  });

  it("redacts secrets nested inside objects", () => {
    log.info("blob", { user: { name: "Nino", credentials: { password: "deep" } } });
    const out = lastOutput();
    expect(out).not.toContain("deep");
    expect(out).toContain("Nino");
  });

  it("redacts secrets inside arrays", () => {
    log.info("blob", { items: [{ password: "arr-secret" }] });
    expect(lastOutput()).not.toContain("arr-secret");
  });
});

describe("log.error()", () => {
  it("returns a short error id", () => {
    const id = log.error("boom", new Error("kaboom"));
    expect(id).toMatch(/^[0-9a-f]{6}$/);
  });

  it("writes the same id it returns", () => {
    const id = log.error("boom", new Error("kaboom"));
    expect(lastOutput()).toContain(id);
  });

  it("records an Error's message but the id is what's surfaced to callers", () => {
    const id = log.error("boom", new Error("kaboom"), { userId: "u1" });
    const out = lastOutput();
    expect(out).toContain("kaboom");
    expect(out).toContain("u1");
    expect(id).toHaveLength(6);
  });

  it("routes errors to console.error", () => {
    const errSpy = spies[2]!;
    log.error("boom");
    expect(errSpy).toHaveBeenCalled();
  });
});
