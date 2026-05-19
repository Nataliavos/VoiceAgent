import { MessageSquareText, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResponseMode } from "@/lib/types";

export function ResponseModeToggle({
  mode,
  onChange,
}: {
  mode: ResponseMode;
  onChange: (m: ResponseMode) => void;
}) {
  const opt = (value: ResponseMode, label: string, Icon: typeof MessageSquareText) => (
    <button
      key={value}
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
      {opt("text", "Text Mode", MessageSquareText)}
      {opt("voice", "Voice Mode", AudioLines)}
    </div>
  );
}
