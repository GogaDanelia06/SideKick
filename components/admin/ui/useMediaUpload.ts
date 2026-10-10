import { useRef, useState } from "react";

export function useMediaUpload(initialUrl?: string | null, initialType?: string | null) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [type, setType] = useState(initialType ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "upload_failed");
        return;
      }
      setUrl(data.url);
      setType(data.type);
    } catch {
      setError("upload_failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return {
    url,
    setUrl,
    isVideo: type === "video" || /\.(mp4|webm)$/i.test(url),
    busy,
    error,
    fileRef,
    upload,
    clear: () => {
      setUrl("");
      setType("");
    },
  };
}
