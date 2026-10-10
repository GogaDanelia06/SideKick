"use client";

import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { MediaPreview } from "./MediaPreview";
import { useMediaUpload } from "./useMediaUpload";

const INPUT =
  "w-full rounded-[8px] border border-input bg-canvas px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-blue";

const ERRORS: Record<string, Text> = {
  not_configured: "admin.mediaField.fileStorageIsNot",
  bad_type: "admin.mediaField.unsupportedFileType",
  too_large: "admin.mediaField.fileIsLargerThan",
  forbidden: "admin.mediaField.notAllowed",
  upload_failed: "admin.mediaField.uploadFailed",
};

export function MediaField({
  name,
  typeName,
  initialUrl,
  initialType,
  imagesOnly = false,
  note,
}: {
  name: string;
  typeName?: string;
  initialUrl?: string | null;
  initialType?: string | null;
  imagesOnly?: boolean;
  note?: Text;
}) {
  const { t } = useLanguage();
  const { url, setUrl, isVideo, busy, error, fileRef, upload, clear } = useMediaUpload(initialUrl, initialType);

  return (
    <div>
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
        {imagesOnly ? t("admin.mediaField.photo") : t("admin.mediaField.photoOrVideo")}
      </span>

      <input type="hidden" name={name} value={url} />
      {typeName ? (
        <input type="hidden" name={typeName} value={url ? (isVideo ? "video" : "image") : ""} />
      ) : null}

      {url ? <MediaPreview url={url} isVideo={isVideo} onClear={clear} /> : null}

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
        <span className="text-[12px] text-faint">{t("admin.mediaField.orPasteAUrl")}</span>
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
          {t(note ?? "admin.mediaField.leaveEmptyToUse")}
          <IconPhoto size={12} className="ml-1 inline" />
        </p>
      )}
    </div>
  );
}
