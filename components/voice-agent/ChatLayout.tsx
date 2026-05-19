"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { buildChatHistory, sendAgentMessage } from "@/lib/chat-api";
import type { Message, ResponseMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { ResponseModeToggle } from "./ResponseModeToggle";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

type ChatLayoutProps = {
  variant?: "full" | "widget";
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onNewChat: () => void;
  draft?: string;
  onDraftConsumed?: () => void;
  onClose?: () => void;
};

export function ChatLayout({
  variant = "full",
  messages,
  setMessages,
  onNewChat,
  draft,
  onDraftConsumed,
  onClose,
}: ChatLayoutProps) {
  const [mode, setMode] = useState<ResponseMode>("text");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isWidget = variant === "widget";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = buildChatHistory([...messages, userMsg]);
      const reply = await sendAgentMessage({
        messages: history,
        responseMode: mode,
      });
      setMessages((m) => [...m, reply]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I could not connect to the agent service. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex bg-background text-foreground",
        isWidget ? "h-full w-full flex-col" : "h-screen w-full",
      )}
    >
      {!isWidget && <Sidebar onNew={onNewChat} />}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "flex shrink-0 items-center justify-between gap-2 border-b border-border/60",
            isWidget ? "px-3 py-2" : "px-4 py-3",
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <h1 className="truncate text-sm font-semibold tracking-tight">
              {isWidget ? "TravelMate" : "TravelMate VoiceAgent"}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isWidget && (
              <button
                type="button"
                onClick={onNewChat}
                disabled={loading}
                aria-label="New chat"
                className="flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <Plus className="h-3 w-3 shrink-0" />
                New chat
              </button>
            )}
            <ResponseModeToggle
              mode={mode}
              onChange={setMode}
              compact={isWidget}
            />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto flex w-full flex-col gap-4 px-4 py-6",
              isWidget ? "max-w-none gap-3 px-3 py-4" : "max-w-3xl gap-6 py-8",
            )}
          >
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                TravelMate is thinking…
              </div>
            )}
          </div>
        </div>

        <ChatInput
          onSend={handleSend}
          disabled={loading}
          draft={draft}
          onDraftConsumed={onDraftConsumed}
          compact={isWidget}
        />
      </main>
    </div>
  );
}
