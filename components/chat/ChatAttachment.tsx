import type { ChatAttachment as Attachment } from "@/lib/chat/types";

export function ChatAttachment({ attachment }: { attachment: Attachment }) {
  const shared = "max-h-[180px] w-auto max-w-full rounded-[8px] object-contain";

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      {attachment.kind === "image" ? (
        <img src={attachment.url} alt={attachment.name} className={shared} />
      ) : (
        <video src={attachment.url} controls preload="metadata" className={shared} />
      )}
      <figcaption className="truncate text-[11px] opacity-70">{attachment.name}</figcaption>
    </figure>
  );
}
