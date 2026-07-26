import { describe, it, expect } from "vitest";
import { normalizeYouTubeUrl } from "./youtube";

const CANONICAL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

describe("normalizeYouTubeUrl — accepted shapes", () => {
  it("canonical watch URL", () => {
    expect(normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("short youtu.be link", () => {
    expect(normalizeYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("embed URL", () => {
    expect(normalizeYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("shorts URL", () => {
    expect(normalizeYouTubeUrl("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("mobile m.youtube.com", () => {
    expect(normalizeYouTubeUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("without a protocol (bare host)", () => {
    expect(normalizeYouTubeUrl("youtube.com/watch?v=dQw4w9WgXcQ")).toBe(CANONICAL);
  });

  it("with surrounding whitespace", () => {
    expect(normalizeYouTubeUrl("  https://youtu.be/dQw4w9WgXcQ  ")).toBe(CANONICAL);
  });

  it("watch URL carrying extra query params keeps only the id", () => {
    expect(normalizeYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PL")).toBe(
      CANONICAL,
    );
  });

  it("always normalises to the same canonical form", () => {
    const forms = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
    ];
    for (const f of forms) expect(normalizeYouTubeUrl(f)).toBe(CANONICAL);
  });
});

describe("normalizeYouTubeUrl — rejected input (security boundary)", () => {
  it("rejects a non-YouTube host", () => {
    expect(normalizeYouTubeUrl("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("rejects a host that merely contains 'youtube'", () => {
    expect(normalizeYouTubeUrl("https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("rejects a javascript: URL", () => {
    expect(normalizeYouTubeUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects an id of the wrong length", () => {
    expect(normalizeYouTubeUrl("https://youtu.be/tooShort")).toBeNull();
    expect(normalizeYouTubeUrl("https://youtu.be/waaaaaaaayTooLong123")).toBeNull();
  });

  it("rejects a watch URL with no id", () => {
    expect(normalizeYouTubeUrl("https://www.youtube.com/watch")).toBeNull();
  });

  it("rejects empty and whitespace-only input", () => {
    expect(normalizeYouTubeUrl("")).toBeNull();
    expect(normalizeYouTubeUrl("   ")).toBeNull();
  });

  it("rejects unparseable junk", () => {
    expect(normalizeYouTubeUrl("http://")).toBeNull();
    expect(normalizeYouTubeUrl("::::")).toBeNull();
  });
});
