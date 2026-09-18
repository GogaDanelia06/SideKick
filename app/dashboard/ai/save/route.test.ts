import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dashboard/actions/business", () => ({ saveBusinessInfo: vi.fn() }));
vi.mock("@/lib/dashboard/actions/aiConfig", () => ({
  saveAiCharacter: vi.fn(),
  saveAiPrompt: vi.fn(),
  saveAiRules: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ getContext: vi.fn() }));
vi.mock("@/lib/logger", () => ({ log: { error: vi.fn() } }));

import { POST } from "./route";
import { saveBusinessInfo } from "@/lib/dashboard/actions/business";
import { saveAiRules } from "@/lib/dashboard/actions/aiConfig";
import { getContext } from "@/lib/session";

const saveBusiness = vi.mocked(saveBusinessInfo);
const body = { userId: "u1", businessId: "b1", section: "business", entries: [["name", "Shop"], ["email", ""]] };

function post(payload: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/dashboard/ai/save", {
      method: "POST",
      headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", ...headers },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );
}

const answer = async (res: Response) => ({ status: res.status, body: await res.json() });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getContext).mockResolvedValue({ userId: "u1", businessId: "b1", role: "OWNER" });
  saveBusiness.mockResolvedValue({ ok: true });
});

describe("POST /dashboard/ai/save", () => {
  it("hands the fields to the section's own action, as the form used to", async () => {
    expect(await answer(await post(body))).toEqual({ status: 200, body: { ok: true } });

    const fd = saveBusiness.mock.calls[0]![0];
    expect([...fd.entries()]).toEqual([["name", "Shop"], ["email", ""]]);
    expect(saveAiRules).not.toHaveBeenCalled();
  });

  it("refuses a save meant for another business or login", async () => {
    for (const other of [{ businessId: "b2" }, { userId: "u2" }]) {
      expect(await answer(await post({ ...body, ...other }))).toEqual({ status: 409, body: { ok: false, error: "moved" } });
    }
    expect(saveBusiness).not.toHaveBeenCalled();
  });

  it("refuses without a session, and passes on the action's permission refusal", async () => {
    vi.mocked(getContext).mockResolvedValueOnce(null);
    expect((await answer(await post(body))).body.error).toBe("signed_out");

    saveBusiness.mockResolvedValueOnce({ ok: false, error: "forbidden" });
    expect(await answer(await post(body))).toEqual({ status: 403, body: { ok: false, error: "forbidden" } });
  });

  it("turns away other sites, other formats and malformed bodies before touching the session", async () => {
    const bad = [
      post(body, { "sec-fetch-site": "cross-site" }),
      post(body, { "content-type": "text/plain" }),
      post("{not json"),
      post({ ...body, section: "billing" }),
      post({ ...body, entries: [["name", 5]] }),
    ];
    for (const res of await Promise.all(bad)) expect((await answer(res)).status).toBe(400);
    expect(getContext).not.toHaveBeenCalled();
  });

  it("refuses a body over 1 MB", async () => {
    const big = { ...body, entries: [["description", "x".repeat(1024 * 1024)]] };
    expect((await post(big)).status).toBe(413);
  });

  it("reports a failed save without throwing", async () => {
    saveBusiness.mockRejectedValueOnce(new Error("db down"));
    expect(await answer(await post(body))).toEqual({ status: 500, body: { ok: false, error: "failed" } });
  });
});
