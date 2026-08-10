import type { ChatAttachment as Attachment } from "@/lib/chat/types";

/**
 * The picked photo or video, inside the message bubble.
 *
 * Capped in height rather than given a fixed box: a portrait phone photo and a
 * landscape screenshot both have to sit in a 340px-wide widget without one of
 * them being cropped to nothing.
 *
 * The video carries `controls` and no autoplay — a clip that starts playing by
 * itself in a support chat is startling, and on a phone it costs the visitor
 * data they did not ask to spend.
 */
export function ChatAttachment({ attachment }: { attachment: Attachment }) {
  const shared = "max-h-[180px] w-auto max-w-full rounded-[8px] object-contain";

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      {attachment.kind === "image" ? (
        // An object URL pointing at the visitor's own disk. next/image exists to
        // optimise remote files it can fetch and resize; there is no server copy
        // of this one to optimise, so <img> is the correct element here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={attachment.url} alt={attachment.name} className={shared} />
      ) : (
        <video src={attachment.url} controls preload="metadata" className={shared} />
      )}
      <figcaption className="truncate text-[11px] opacity-70">{attachment.name}</figcaption>
    </figure>
  );
}
