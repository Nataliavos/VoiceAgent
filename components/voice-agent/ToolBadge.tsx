import { Calculator, Globe, Code2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolUsage } from "@/lib/types";

const ICONS = {
  Calculator: Calculator,
  "Web Search": Globe,
  "Code Interpreter": Code2,
} as const;

const ACCENTS: Record<string, string> = {
  Calculator: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Web Search": "bg-sky-500/10 text-sky-500 border-sky-500/20",
  "Code Interpreter": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export function ToolBadge({ tool }: { tool: ToolUsage }) {
  const Icon = ICONS[tool.name] ?? Wrench;
  const accent = ACCENTS[tool.name] ?? "bg-primary/10 text-primary border-primary/20";
  return (
    <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium">
      <span className={cn("flex h-5 w-5 items-center justify-center rounded border", accent)}>
        <Icon className="h-3 w-3" />
      </span>
      <span className="text-muted-foreground">Tool used:</span>
      <span className="text-foreground">{tool.name}</span>
    </div>
  );
}

