import { describe, expect, it } from "vitest";
import { MAX_BYTES, classifyAttachment } from "./attachment";

/** `File` needs a size we control, and a real 8MB buffer in a unit test is waste. */
function fake(type: string, size: number): File {
  const file = new File(["x"], "sample", { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("classifyAttachment", () => {
  it("accepts the image formats a browser can render", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
      expect(classifyAttachment(fake(type, 1000)), type).toEqual({ kind: "image" });
    }
  });

  it("accepts mp4 and webm video", () => {
    for (const type of ["video/mp4", "video/webm"]) {
      expect(classifyAttachment(fake(type, 1000)), type).toEqual({ kind: "video" });
    }
  });

  it("refuses anything else, including SVG", () => {
    for (const type of [
      "image/svg+xml", // a document that can carry script, from an anonymous visitor
      "application/pdf",
      "application/zip",
      "text/html",
      "application/octet-stream",
      "",
    ]) {
      expect(classifyAttachment(fake(type, 1000)), type).toEqual({ error: "bad_type" });
    }
  });

  it("refuses a file over the cap", () => {
    expect(classifyAttachment(fake("image/png", MAX_BYTES + 1))).toEqual({ error: "too_large" });
  });

  it("allows a file exactly on the cap", () => {
    expect(classifyAttachment(fake("image/png", MAX_BYTES))).toEqual({ kind: "image" });
  });

  it("calls a wrong type wrong even when it is also too big", () => {
    expect(classifyAttachment(fake("application/zip", MAX_BYTES + 1))).toEqual({
      error: "bad_type",
    });
  });
});
