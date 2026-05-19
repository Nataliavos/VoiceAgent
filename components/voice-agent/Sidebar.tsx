import { Sparkles, MessageSquare, Plus } from "lucide-react";

export function Sidebar({ onNew }: { onNew: () => void }) {
  const recent = [
    "Budget estimate",
    "Destination search",
    "Travel itinerary",
  ];
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar p-3 md:flex">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">TravelMate</span>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="mt-3 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
      >
        <Plus className="h-3.5 w-3.5" />
        New chat
      </button>
      <div className="mt-5 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Recent
      </div>
      <nav className="mt-1 flex flex-col gap-0.5">
        {recent.map((r) => (
          <button
            key={r}
            type="button"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="truncate">{r}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto px-2 py-2 text-[10px] text-muted-foreground">
        Mock UI · v0.1
      </div>
    </aside>
  );
}
