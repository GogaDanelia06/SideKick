const ID_PREFIXES = ["/embed/", "/shorts/"];

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
    const prefix = ID_PREFIXES.find((p) => url.pathname.startsWith(p));
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (prefix) id = url.pathname.slice(prefix.length);
  }

  id = id?.split("/")[0] ?? null;
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function youtubeThumbnail(url: string): string | null {
  try {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}
