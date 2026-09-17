import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Store = typeof import("./testerChat");

const data = new Map<string, string>();
const storage = {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => void data.set(key, value),
  removeItem: (key: string) => void data.delete(key),
};

const saved = () => JSON.parse(data.get("sidekick.tester") ?? "null");
const AI = { from: "ai" as const, text: "გამარჯობა!" };

let chat: Store;

/** A fresh module is a page reload: only what is in storage survives. */
async function reload() {
  vi.resetModules();
  chat = await import("./testerChat");
}

beforeEach(async () => {
  data.clear();
  vi.stubGlobal("localStorage", storage);
  await reload();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("tester chat", () => {
  it("keeps the questions and answers in the browser", () => {
    const thread = chat.askTester("login-1", "hi");
    expect(thread).toMatch(/^[0-9a-f]{16}$/);
    expect(chat.answerTester(thread!, AI)).toBe(true);

    expect(saved()).toEqual({ loginId: "login-1", thread, turns: [{ from: "you", text: "hi" }, AI] });
  });

  it("continues the same chat and AI thread after a reload", async () => {
    const thread = chat.askTester("login-1", "hi")!;
    chat.answerTester(thread, AI);

    await reload();
    expect(chat.askTester("login-1", "again")).toBe(thread);
    expect(saved().turns).toHaveLength(3);
  });

  it("starts over for a new login instead of showing the last one's chat", () => {
    const first = chat.askTester("login-1", "hi")!;
    chat.answerTester(first, AI);

    const second = chat.askTester("login-2", "hello");
    expect(second).not.toBe(first);
    expect(saved()).toEqual({ loginId: "login-2", thread: second, turns: [{ from: "you", text: "hello" }] });
  });

  it("asks one question at a time", () => {
    const thread = chat.askTester("login-1", "one")!;
    expect(chat.askTester("login-1", "two")).toBeNull();

    // A failed answer adds nothing, but the next question may be asked.
    expect(chat.answerTester(thread, null)).toBe(true);
    expect(chat.askTester("login-1", "two")).toBe(thread);
    expect(saved().turns.map((t: { text: string }) => t.text)).toEqual(["one", "two"]);
  });

  it("drops an answer that arrives after the chat was cleared", () => {
    const thread = chat.askTester("login-1", "hi")!;
    chat.clearTesterChat();
    expect(data.has("sidekick.tester")).toBe(false);

    expect(chat.answerTester(thread, AI)).toBe(false);
    expect(data.has("sidekick.tester")).toBe(false);
    expect(chat.askTester("login-1", "new")).not.toBe(thread);
  });

  it("ignores a damaged stored value", async () => {
    data.set("sidekick.tester", "{broken");
    await reload();

    expect(chat.askTester("login-1", "hi")).toMatch(/^[0-9a-f]{16}$/);
    expect(saved().turns).toHaveLength(1);
  });

  it("keeps only the newest turns", () => {
    for (let i = 0; i < 60; i++) chat.answerTester(chat.askTester("login-1", `q${i}`)!, AI);

    expect(saved().turns).toHaveLength(100);
    expect(saved().turns[0]).toEqual({ from: "you", text: "q10" });
  });

  it("still works for the page's lifetime when storage refuses to save", () => {
    vi.stubGlobal("localStorage", { ...storage, setItem: () => { throw new Error("quota"); } });

    const thread = chat.askTester("login-1", "hi")!;
    expect(chat.answerTester(thread, AI)).toBe(true);
    expect(chat.askTester("login-1", "again")).toBe(thread);
  });
});
