import { beforeEach, describe, expect, it, vi } from "vitest";

const upsert = vi.fn();
vi.mock("@/lib/db", () => ({ prisma: { analyticsDaily: { upsert: (...a: unknown[]) => upsert(...a) } } }));

const { recordEvent } = await import("./record");

/** The path the upsert was keyed on, or null if nothing was written. */
async function pathFor(raw: string): Promise<string | null> {
  upsert.mockClear();
  upsert.mockResolvedValue({});
  await recordEvent("page_view", raw);
  return upsert.mock.calls.length
    ? (upsert.mock.calls[0]![0] as { where: { day_name_path: { path: string } } }).where
        .day_name_path.path
    : null;
}

beforeEach(() => vi.clearAllMocks());

describe("recordEvent", () => {
  it("refuses an event name that is not on the closed list", async () => {
    upsert.mockResolvedValue({});
    await recordEvent("definitely_not_real", "/");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("keeps the paths the site actually has", async () => {
    expect(await pathFor("/")).toBe("/");
    expect(await pathFor("/pricing")).toBe("/pricing");
    expect(await pathFor("/dashboard/billing/return")).toBe("/dashboard/billing/return");
  });

  it("strips query strings and fragments — one page, not many", async () => {
    expect(await pathFor("/pricing?utm_source=fb")).toBe("/pricing");
    expect(await pathFor("/about#team")).toBe("/about");
  });

  /**
   * The reason this file exists: /api/track is public, and `day_name_path` is
   * unique. Without folding, anyone could post a million paths and get a
   * million rows on a database with half a gigabyte to its name.
   */
  it("folds anything unrecognised into a single bucket", async () => {
    expect(await pathFor("/made-up")).toBe("other");
    expect(await pathFor("/wp-admin.php")).toBe("other");
    expect(await pathFor("/" + "a".repeat(5000))).toBe("other");
    expect(await pathFor("not-even-a-path")).toBe("other");
  });

  it("does not let a trailing slash split one page in two", async () => {
    expect(await pathFor("/pricing/")).toBe("/pricing");
    expect(await pathFor("/")).toBe("/");
  });

  it("survives the database being unavailable", async () => {
    upsert.mockRejectedValue(new Error("connection lost"));
    await expect(recordEvent("page_view", "/")).resolves.toBeUndefined();
  });
});
