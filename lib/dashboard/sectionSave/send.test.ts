import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendSave } from "./send";

const fetchMock = vi.fn();
const request = { userId: "u1", businessId: "b1", section: "business" as const, entries: [["name", "Shop"]] as [string, string][] };
const reply = (status: number, body?: unknown, type: ResponseType = "basic") =>
  ({ ok: status >= 200 && status < 300, status, type, json: async () => body }) as Response;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("sendSave()", () => {
  it("posts the form as JSON with keepalive, so it outlives a closing tab", async () => {
    fetchMock.mockResolvedValue(reply(200, { ok: true }));

    expect(await sendSave(request)).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/dashboard/ai/save");
    expect(init).toMatchObject({ method: "POST", keepalive: true, redirect: "manual", credentials: "same-origin" });
    expect(JSON.parse(init.body)).toEqual(request);
  });

  it("skips keepalive for a body browsers would refuse it for", async () => {
    fetchMock.mockResolvedValue(reply(200, { ok: true }));
    await sendSave({ ...request, entries: [["description", "ა".repeat(30_000)]] });
    expect(fetchMock.mock.calls[0]![1].keepalive).toBe(false);
  });

  it("reads why the server refused", async () => {
    fetchMock.mockResolvedValueOnce(reply(409, { ok: false, error: "moved" }));
    fetchMock.mockResolvedValueOnce(reply(403, { ok: false, error: "forbidden" }));
    fetchMock.mockResolvedValueOnce(reply(500, { error: "something new" }));

    expect(await sendSave(request)).toEqual({ ok: false, error: "moved" });
    expect(await sendSave(request)).toEqual({ ok: false, error: "forbidden" });
    expect(await sendSave(request)).toEqual({ ok: false, error: "failed" });
  });

  it("treats the redirect to the login page as a signed-out session", async () => {
    fetchMock.mockResolvedValue(reply(0, undefined, "opaqueredirect"));
    expect(await sendSave(request)).toEqual({ ok: false, error: "signed_out" });
  });

  it("reports a network failure instead of throwing", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    expect(await sendSave(request)).toEqual({ ok: false, error: "failed" });
  });
});
