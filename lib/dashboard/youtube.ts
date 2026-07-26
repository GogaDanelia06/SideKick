export function normalizeYouTubeUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.slice(7);
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.slice(8);
  }

  id = id?.split("/")[0] ?? null;
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
}
