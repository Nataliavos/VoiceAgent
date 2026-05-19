"use client";

import { MessageCircle } from "lucide-react";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { cn } from "@/lib/utils";
import { ChatLayout } from "./ChatLayout";

type FloatingChatWidgetProps = {
  open: boolean;
  draft?: string;
  onOpen: () => void;
  onClose: () => void;
  onDraftConsumed?: () => void;
};

export function FloatingChatWidget({
  open,
  draft,
  onOpen,
  onClose,
  onDraftConsumed,
}: FloatingChatWidgetProps) {
  const { messages, setMessages, resetChat } = useChatMessages();

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-border/60",
            "bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg",
            "transition-opacity hover:opacity-90",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          Ask TravelMate
        </button>
      )}

      {open && (
        <button
          type="button"
          aria-label="Close chat backdrop"
          className="fixed inset-0 z-40 bg-black/50 md:bg-black/20"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl",
          "bottom-0 right-0 h-[min(100dvh,720px)] w-full sm:bottom-6 sm:right-6",
          "sm:h-[min(90vh,700px)] sm:w-[min(calc(100vw-2rem),460px)]",
          !open && "pointer-events-none invisible",
        )}
        aria-hidden={!open}
      >
        <ChatLayout
          variant="widget"
          messages={messages}
          setMessages={setMessages}
          onNewChat={resetChat}
          draft={draft}
          onDraftConsumed={onDraftConsumed}
          onClose={onClose}
        />
      </div>
    </>
  );
}
