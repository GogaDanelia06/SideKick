"use client";

import { useEffect, useRef, useState } from "react";
import { IconLoader2, IconPhoto, IconX } from "@tabler/icons-react";
import type { Bilingual } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { resizePhoto, type ResizeError } from "@/lib/products/resizePhoto";
import { PHOTO_ERRORS } from "./productErrors";

/**
 * The product form's photo box: click or drop a photo. It is shrunk here and put back
 * into the form's own `<input name="photo">`, so the form sends it with the other
 * fields. `current` is the saved photo; removing it sends `removePhoto`.
 */
export function PhotoPicker({ current, label }: { current?: string; label: Bilingual }) {
  const { t } = useLanguage();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ResizeError | null>(null);

  // An object URL keeps the file in memory until it is revoked.
  useEffect(() => () => void (preview?.startsWith("blob:") && URL.revokeObjectURL(preview)), [preview]);

  async function choose(file: File | undefined) {
    const field = input.current;
    if (!file || !field) return;
    // Emptied first: the original, often several MB, must never be what the form sends.
    field.value = "";
    setBusy(true);
    setError(null);
    const result = await resizePhoto(file);
    setBusy(false);
    if (typeof result === "string") return setError(result);

    const files = new DataTransfer();
    files.items.add(result);
    field.files = files.files;
    setPreview(URL.createObjectURL(result));
    setRemoved(false);
  }

  function clear() {
    if (input.current) input.current.value = "";
    setPreview(null);
    setRemoved(Boolean(current));
    setError(null);
  }

  return (
    <div>
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void choose(event.dataTransfer.files[0]);
        }}
        className="relative grid h-[120px] cursor-pointer place-items-center overflow-hidden rounded-[10px] border-[1.5px] border-dashed border-border bg-soft text-center text-[11px] text-faint hover:border-blue has-[:focus-visible]:border-blue"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local preview or the stored photo, both already small
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span>
            {busy ? <IconLoader2 size={24} className="mx-auto animate-spin" /> : <IconPhoto size={24} className="mx-auto" />}
            <span className="mt-1 block">{t(label)}</span>
          </span>
        )}
        <input
          ref={input}
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          aria-label={t(label)}
          onChange={(event) => void choose(event.target.files?.[0])}
          className="sr-only"
        />
      </label>
      {preview ? (
        <button type="button" onClick={clear} className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted hover:text-red">
          <IconX size={13} /> {t({ ka: "ფოტოს წაშლა", en: "Remove photo" })}
        </button>
      ) : null}
      {removed ? <input type="hidden" name="removePhoto" value="on" /> : null}
      {error ? (
        <p role="alert" className="mt-1 text-[11px] leading-snug text-red">
          {t(PHOTO_ERRORS[error])}
        </p>
      ) : null}
    </div>
  );
}
