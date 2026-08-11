import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo/site";
import { WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/lib/content/wordmark";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1117",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* The real wordmark, drawn from its own paths.
            This is generated at the edge by Satori, which has no access to the
            app's fonts — so the tagline is left off here rather than rendered
            in whatever it falls back to. The letters are outlines and carry no
            such risk. */}
        <div style={{ display: "flex" }}>
          <svg width="420" height="83" viewBox={WORDMARK_VIEWBOX} fill="#e6edf3">
            {WORDMARK_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontWeight: 700,
              color: "#e6edf3",
              lineHeight: 1.12,
              maxWidth: "1000px",
            }}
          >
            The AI assistant that replies, captures leads, and sells — 24/7.
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#7d8590" }}>
            Facebook · Instagram · WhatsApp
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "30px", fontWeight: 500, color: "#3fb950" }}>
          sidekick.ge
        </div>
      </div>
    ),
    size,
  );
}
