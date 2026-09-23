import { describe, it, expect, vi, beforeEach } from "vitest";
import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { IDLE_COOKIE, IDLE_MAX_SEC, stampMarker } from "./idle";

const SECRET = "test-secret-for-the-idle-sign-out-0123456789";
const SESSION = "authjs.session-token";

beforeEach(() => vi.stubEnv("AUTH_SECRET", SECRET));

async function visit(cookies: Record<string, string>) {
  const { default: proxy } = await import("@/proxy");
  const cookie = Object.entries(cookies).map(([name, value]) => `${name}=${value}`).join("; ");
  // Host and protocol as a browser sends them: without them Auth.js assumes https and a __Secure- cookie.
  const headers = { cookie, host: "localhost", "x-forwarded-proto": "http" };
  const request = new NextRequest("http://localhost/dashboard/products", { headers });
  return (proxy as unknown as (req: NextRequest, ctx: unknown) => Promise<Response>)(request, {});
}

const deleted = (res: Response, name: string) =>
  res.headers.getSetCookie().some((c) => c.startsWith(`${name}=;`) && /Expires=Thu, 01 Jan 1970/.test(c));

describe("proxy idle sign-out", () => {
  it("ends the session and every parked account, not just the idle marker", async () => {
    const token = await encode({
      token: { uid: "u1", remember: false, startedAt: Date.now() - 60_000 },
      secret: SECRET,
      salt: SESSION,
      maxAge: 3600,
    });
    const idleSince = await stampMarker(SECRET, Date.now() - (IDLE_MAX_SEC + 60) * 1000);

    const res = await visit({ [SESSION]: token, [IDLE_COOKIE]: idleSince, "sk.acct.1": "parked" });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?callbackUrl=%2Fdashboard%2Fproducts");
    // Before, only the marker went: the next visit looked fresh and the session walked back in.
    expect(deleted(res, SESSION)).toBe(true);
    expect(deleted(res, "sk.acct.1")).toBe(true);
  });

  it("lets an active session through untouched", async () => {
    const token = await encode({
      token: { uid: "u1", remember: false, startedAt: Date.now() - 60_000 },
      secret: SECRET,
      salt: SESSION,
      maxAge: 3600,
    });
    const res = await visit({ [SESSION]: token, [IDLE_COOKIE]: await stampMarker(SECRET) });
    expect(res.headers.get("location")).toBeNull();
    expect(deleted(res, SESSION)).toBe(false);
  });
});
