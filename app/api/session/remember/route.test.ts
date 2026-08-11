import { describe, it, expect, vi, beforeEach } from "vitest";

const set = vi.fn();
const getAll = vi.fn();

vi.mock("next/headers", () => ({ cookies: async () => ({ getAll, set }) }));
vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { POST } from "./route";
import { auth } from "@/auth";

const signedIn = () => vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);

beforeEach(() => {
  vi.clearAllMocks();
  signedIn();
  getAll.mockReturnValue([{ name: "authjs.session-token", value: "jwt-value" }]);
});

describe("POST /api/session/remember", () => {
  it("refuses a caller who is not signed in", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const res = await POST();

    expect(res.status).toBe(401);
    expect(set).not.toHaveBeenCalled();
  });

  /** The whole point: no maxAge and no expires makes it die with the browser. */
  it("rewrites the session cookie with no lifetime", async () => {
    await POST();

    expect(set).toHaveBeenCalledOnce();
    const [name, value, options] = set.mock.calls[0]!;
    expect(name).toBe("authjs.session-token");
    expect(value).toBe("jwt-value");
    expect(options).not.toHaveProperty("maxAge");
    expect(options).not.toHaveProperty("expires");
    expect(options.httpOnly).toBe(true);
    expect(options.path).toBe("/");
  });

  /** A large session is split across `.0`, `.1`; leaving one chunk persistent
   *  would store half a credential. */
  it("rewrites every chunk of a split session", async () => {
    getAll.mockReturnValue([
      { name: "__Secure-authjs.session-token.0", value: "a" },
      { name: "__Secure-authjs.session-token.1", value: "b" },
      { name: "unrelated", value: "x" },
    ]);

    const res = await POST();

    expect(set).toHaveBeenCalledTimes(2);
    expect(set.mock.calls.map((c) => c[0])).toEqual([
      "__Secure-authjs.session-token.0",
      "__Secure-authjs.session-token.1",
    ]);
    await expect(res.json()).resolves.toEqual({ ok: true, rewritten: 2 });
  });

  it("leaves cookies that are not the session alone", async () => {
    getAll.mockReturnValue([
      { name: "authjs.csrf-token", value: "c" },
      { name: "theme", value: "dark" },
    ]);

    await POST();

    expect(set).not.toHaveBeenCalled();
  });
});
