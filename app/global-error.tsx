"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ka">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#0d1117",
          color: "#e6edf3",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">
            ⚠
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 10px" }}>
            რაღაც შეფერხდა
          </h1>
          <p style={{ margin: "0 0 6px", color: "#7d8590", fontSize: 14 }}>
            აპლიკაციის ჩატვირთვისას მოხდა შეცდომა. სცადეთ თავიდან.
          </p>
          <p style={{ margin: "0 0 24px", color: "#6e7681", fontSize: 13 }}>
            Something went wrong while loading the application. Please try again.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              background: "#238636",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            თავიდან ცდა / Try again
          </button>

          {error.digest ? (
            <p style={{ marginTop: 24, fontSize: 12, color: "#6e7681" }}>
              შეცდომის კოდი / Error code:{" "}
              <span style={{ fontFamily: "ui-monospace, monospace" }}>{error.digest}</span>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
