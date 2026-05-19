import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-sm",
            "focus-within:border-ring/60",
          )}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message TravelMate…"
            rows={1}
            className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
