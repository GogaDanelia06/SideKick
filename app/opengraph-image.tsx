import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo/site";

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
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              width: "96px",
              height: "96px",
              borderRadius: "20px",
              background: "#238636",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="#ffffff"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13 2 L4 13 h6 l-1 9 l9 -12 h-6 z" />
            </svg>
          </div>
          <span style={{ fontSize: "52px", fontWeight: 700, color: "#e6edf3" }}>Sidekick</span>
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
