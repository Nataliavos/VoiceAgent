import { MessageSquareText, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResponseMode } from "@/lib/types";

export function ResponseModeToggle({
  mode,
  onChange,
  compact = false,
}: {
  mode: ResponseMode;
  onChange: (m: ResponseMode) => void;
  compact?: boolean;
}) {
  const opt = (value: ResponseMode, label: string, Icon: typeof MessageSquareText) => (
    <button
      key={value}
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        "flex items-center gap-1 rounded-md font-medium transition-colors",
        compact ? "px-2 py-1 text-[10px]" : "gap-1.5 px-3 py-1.5 text-xs",
        mode === value
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-pressed={mode === value}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border/60 bg-secondary/40",
        compact ? "gap-0.5 p-0.5" : "gap-1 p-1",
      )}
    >
      {opt("text", compact ? "Text" : "Text Mode", MessageSquareText)}
      {opt("voice", compact ? "Voice" : "Voice Mode", AudioLines)}
    </div>
  );
}
