"use client";

import type { ConversationDetail } from "@/lib/dashboard/queries";
import { ChatHeader } from "./chat/ChatHeader";
import { CorrectionBar } from "./chat/CorrectionBar";
import { CorrectionDialog } from "./chat/CorrectionDialog";
import { EmptyChat } from "./chat/EmptyChat";
import { MessageList } from "./chat/MessageList";
import { ReplyBar } from "./chat/ReplyBar";
import { useChatReply, type ChatMessage } from "./chat/useChatReply";
import { useCorrection } from "./chat/useCorrection";

export function ChatDetail({
  chat,
  loading = false,
  onBack,
  onSent,
  onLead,
  onAiChange,
  onReleased,
}: {
  chat: ConversationDetail | null;
  loading?: boolean;
  onBack: () => void;
  onSent: (message: ChatMessage) => void;
  onLead: () => void;
  onAiChange?: (aiEnabled: boolean) => void;
  onReleased?: () => void;
}) {
  const composer = useChatReply(chat, onSent, onLead);
  const correction = useCorrection(chat?.id ?? null);

  if (!chat) return <EmptyChat />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-border bg-surface">
      <ChatHeader
        chat={chat}
        makingLead={composer.makingLead}
        onBack={onBack}
        onMakeLead={() => void composer.makeLead()}
        onReleased={onReleased}
        onAiChange={onAiChange}
        correcting={correction.active}
        onCorrect={correction.active ? correction.stop : correction.start}
      />
      <MessageList
        chatId={chat.id}
        messages={chat.messages}
        loading={loading}
        selectable={correction.active}
        selected={correction.selected}
        onToggle={correction.toggle}
      />
      {correction.active ? (
        <CorrectionBar count={correction.selected.length} onCancel={correction.stop} onNext={correction.openDialog} />
      ) : (
        <ReplyBar
          notice={composer.notice}
          draft={composer.draft}
          sending={composer.sending}
          onChange={composer.changeDraft}
          onSubmit={() => void composer.reply()}
        />
      )}
      {correction.dialog ? (
        <CorrectionDialog
          conversationId={chat.id}
          messageIds={correction.selected}
          onClose={correction.closeDialog}
          onSaved={correction.stop}
        />
      ) : null}
    </div>
  );
}
