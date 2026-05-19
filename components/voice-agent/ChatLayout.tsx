"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { buildChatHistory, sendAgentMessage } from "@/lib/chat-api";
import { initialMessages } from "@/lib/mock-chat";
import type { Message, ResponseMode } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { ResponseModeToggle } from "./ResponseModeToggle";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [mode, setMode] = useState<ResponseMode>("text");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  const handleNew = () => setMessages(initialMessages);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar onNew={handleNew} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight">TravelMate VoiceAgent</h1>
            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              AI Travel Assistant
            </span>
          </div>
          <ResponseModeToggle mode={mode} onChange={setMode} />
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
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

        <ChatInput onSend={handleSend} disabled={loading} />
      </main>
    </div>
  );
}
