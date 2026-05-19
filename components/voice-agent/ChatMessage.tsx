import type { ReactNode } from "react";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { ToolBadge } from "./ToolBadge";
import { VoicePlayer } from "./VoicePlayer";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Lightweight markdown-ish renderer: bold + code blocks + line breaks.
// Keeps the MVP free of extra deps; swap for react-markdown later.
function RichContent({ text }: { text: string }) {
  const blocks = text.split(/```(\w+)?\n?([\s\S]*?)```/g);
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (i % 3 === 0) {
      const para = blocks[i];
      if (!para) continue;
      out.push(
        <p key={`p-${i}`} className="whitespace-pre-wrap leading-relaxed">
          {para.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
            /^\*\*[^*]+\*\*$/.test(seg) ? (
              <strong key={j}>{seg.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{seg}</span>
            ),
          )}
        </p>,
      );
    } else if (i % 3 === 2) {
      out.push(
        <pre
          key={`c-${i}`}
          className="my-2 overflow-x-auto rounded-md border border-border/60 bg-secondary/40 p-3 text-xs"
        >
          <code>{blocks[i]}</code>
        </pre>,
      );
    }
  }
  return <div className="space-y-2 text-sm">{out}</div>;
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div className={cn("flex max-w-[78%] flex-col", isUser ? "items-end" : "items-start")}>
        {message.tool && !isUser && <ToolBadge tool={message.tool} />}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border/60 bg-card text-card-foreground",
          )}
        >
          <RichContent text={message.content} />
          {message.audioUrl && !isUser && <VoicePlayer src={message.audioUrl} />}
        </div>
        <span className="mt-1 px-1 text-[10px] text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
