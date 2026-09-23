"use client";

import { useRef, useState } from "react";
import { IconPhoto, IconTrash, IconUpload, IconVideo } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Text> = {
  not_configured: "admin.mediaField.fileStorageIsNot",
  bad_type: "admin.mediaField.unsupportedFileType",
  too_large: "admin.mediaField.fileIsLargerThan",
  forbidden: "admin.mediaField.notAllowed",
  upload_failed: "admin.mediaField.uploadFailed",
};

/** Upload-or-paste media picker; the URL field works even without blob storage. */
export function MediaField({
  name,
  typeName,
  initialUrl,
  initialType,
  imagesOnly = false,
  note,
}: {
  name: string;
  /** Form field for "image" or "video", when the caller stores the media type. */
  typeName?: string;
  initialUrl?: string | null;
  initialType?: string | null;
  /** Refuse video wherever the result is rendered with <img>. */
  imagesOnly?: boolean;
  /** Replaces the standing advice under the field, which is slide-specific. */
  note?: Text;
}) {
  const { t } = useLanguage();
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

  const isVideo = type === "video" || /\.(mp4|webm)$/i.test(url);

  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
        {imagesOnly
          ? t("admin.mediaField.photo")
          : t("admin.mediaField.photoOrVideo")}
      </span>

      <input type="hidden" name={name} value={url} />
      {typeName ? (
        <input type="hidden" name={typeName} value={url ? (isVideo ? "video" : "image") : ""} />
      ) : null}

      {url ? (
        <div className="mb-2 flex items-center gap-3 rounded-[8px] border border-border bg-soft p-2">
          {isVideo ? (
            <span className="grid size-14 shrink-0 place-items-center rounded-[6px] bg-canvas text-muted">
              <IconVideo size={22} />
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-14 shrink-0 rounded-[6px] object-cover" />
          )}
          <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{url}</span>
          <button
            type="button"
            onClick={() => { setUrl(""); setType(""); }}
            aria-label={t("admin.mediaField.remove")}
            className="grid size-8 shrink-0 place-items-center rounded-[7px] border border-border text-red hover:border-red"
          >
            <IconTrash size={15} />
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] font-medium disabled:opacity-60"
        >
          {busy ? "…" : <IconUpload size={15} />}
          {t("admin.mediaField.upload")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={imagesOnly ? "image/*" : "image/*,video/mp4,video/webm"}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <span className="text-[12px] text-faint">
          {t("admin.mediaField.orPasteAUrl")}
        </span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={`${INPUT} flex-1 min-w-[200px]`}
        />
      </div>

      {error ? (
        <p className="mt-1.5 text-[12px] text-amber">
          {t(ERRORS[error] ?? "admin.mediaField.somethingWentWrong")}
        </p>
      ) : (
        <p className="mt-1.5 text-[12px] text-faint">
          {t(
            note ?? "admin.mediaField.leaveEmptyToUse",
          )}
          <IconPhoto size={12} className="ml-1 inline" />
        </p>
      )}
    </div>
  );
}
