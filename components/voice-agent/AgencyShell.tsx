import { Calculator, Map, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    title: "Custom Itineraries",
    description: "Day-by-day plans tailored to your dates and interests.",
    icon: Map,
  },
  {
    title: "Travel Budget Estimates",
    description: "Hotel, food, and transport totals with exact calculations.",
    icon: Calculator,
  },
  {
    title: "Destination Recommendations",
    description: "Current tips and highlights from live web search.",
    icon: Search,
  },
] as const;

export const QUICK_PROMPTS = [
  "Plan a 3-day trip to Cartagena",
  "Estimate my travel budget",
  "Search current travel recommendations",
] as const;

export function AgencyShell({
  onQuickPrompt,
  disabled,
}: {
  onQuickPrompt: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <section className="shrink-0 border-b border-border/60 bg-gradient-to-b from-primary/5 to-background px-4 py-5">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          Travel agency
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          TravelMate Agency
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Plan trips, estimate budgets, and get destination guidance with an AI
          travel assistant.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {SERVICES.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-lg border border-border/60 bg-card/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">{title}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onQuickPrompt(prompt)}
              className={cn(
                "rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-foreground transition-colors",
                "hover:border-primary/40 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
