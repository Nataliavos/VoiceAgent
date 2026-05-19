"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calculator,
  Compass,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Radio,
  Sparkles,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type FeaturedDestination = {
  name: string;
  image: string;
  description: string;
  highlights: [string, string];
  bestFor: string;
  budgetRange: string;
  prompt: string;
};

type CompactDestination = {
  name: string;
  image: string;
  descriptor: string;
  details: string;
  prompt: string;
};

const FEATURED_DESTINATIONS: FeaturedDestination[] = [
  {
    name: "Cartagena",
    image: "/images/destinations/cartagena.jpeg",
    description:
      "Colonial walls, Caribbean breeze, and island day trips within easy reach of the old city.",
    highlights: ["Walled city walks", "Rosario Islands"],
    bestFor: "First-time Colombia, couples, culture + beach",
    budgetRange: "$80–$150 / day",
    prompt: "Plan a 3-day trip to Cartagena",
  },
  {
    name: "Medellín",
    image: "/images/destinations/medellin.jpg",
    description:
      "A modern valley city known for innovation, nightlife, and quick access to coffee country.",
    highlights: ["Comuna 13 tours", "Guatapé day trips"],
    bestFor: "City lovers, foodies, digital nomads",
    budgetRange: "$60–$120 / day",
    prompt: "Search current travel recommendations for Medellín",
  },
  {
    name: "San Andrés",
    image: "/images/destinations/san-andres.png",
    description:
      "Turquoise sea, relaxed island pace, and reef-friendly beaches on Colombia's Caribbean isle.",
    highlights: ["Johnny Cay", "Snorkeling & seafood"],
    bestFor: "Beach getaways, families, diving",
    budgetRange: "$90–$160 / day",
    prompt: "Tell me about a trip to San Andrés",
  },
  {
    name: "Guatapé",
    image: "/images/destinations/guatape.jpeg",
    description:
      "Colorful lakeside town at the foot of El Peñol—ideal as a day trip or overnight escape.",
    highlights: ["Piedra del Peñol", "Boat tours on the reservoir"],
    bestFor: "Day trips from Medellín, photography",
    budgetRange: "$50–$90 / day",
    prompt: "Plan a day trip to Guatapé from Medellín",
  },
  {
    name: "Eje Cafetero",
    image: "/images/destinations/eje-cafetero.jpg",
    description:
      "Rolling green hills, coffee farms, and slow travel between Manizales, Pereira, and Armenia.",
    highlights: ["Coffee farm tours", "Cocora Valley hikes"],
    bestFor: "Nature, coffee culture, relaxed pacing",
    budgetRange: "$55–$100 / day",
    prompt: "Plan a trip to Colombia's Coffee Region",
  },
];

const MORE_DESTINATIONS: CompactDestination[] = [
  {
    name: "Amazonas",
    image: "/images/destinations/amazonas.jpg",
    descriptor: "Rainforest & river journeys",
    details:
      "Jungle lodges, river boats, and indigenous community visits in Colombia's deep Amazon.",
    prompt: "Plan an Amazon rainforest experience in Colombia",
  },
  {
    name: "Guainía",
    image: "/images/destinations/guainia.jpg",
    descriptor: "Cerros & remote rivers",
    details:
      "Mavecure hills and star-filled nights in one of Colombia's most remote departments.",
    prompt: "Tell me about visiting Guainía",
  },
  {
    name: "Nariño",
    image: "/images/destinations/narino.jpeg",
    descriptor: "Andean south & Pasto",
    details:
      "Laguna de la Cocha, highland landscapes, and border-region culture near Ecuador.",
    prompt: "Search travel recommendations for Nariño, Colombia",
  },
  {
    name: "Nuquí",
    image: "/images/destinations/nuqui.jpg",
    descriptor: "Pacific coast & whales",
    details:
      "Untamed beaches, whale season (Jul–Oct), and eco-lodges on the Chocó coast.",
    prompt: "Tell me about Nuquí and the Pacific coast",
  },
  {
    name: "Bogotá",
    image: "/images/destinations/bogota.jpeg",
    descriptor: "Capital culture & cuisine",
    details:
      "Museums, Monserrate views, and a strong food scene—often the start or end of a route.",
    prompt: "Plan a weekend in Bogotá",
  },
  {
    name: "Villa de Leyva",
    image: "/images/destinations/villa-de-leyva.jpg",
    descriptor: "Colonial town & mountains",
    details:
      "Cobblestone streets, fossil museums, and easy weekend trips from Bogotá.",
    prompt: "Plan a trip to Villa de Leyva",
  },
  {
    name: "La Guajira",
    image: "/images/destinations/guajira.jpg",
    descriptor: "Desert coast & Wayuu culture",
    details:
      "Cabo de la Vela, Punta Gallinas, and stark landscapes at the northern tip of South America.",
    prompt: "Tell me about traveling to La Guajira",
  },
];

const PLANNING_TOOLS = [
  {
    title: "Destination Explorer",
    description: "Browse curated places and build your own route across Colombia.",
    icon: MapPin,
    opensAssistant: false,
  },
  {
    title: "Budget Planner",
    description: "Estimate hotel, food, and transport with exact calculator-backed totals.",
    icon: Calculator,
    opensAssistant: false,
  },
  {
    title: "Local Guide Tips",
    description: "Practical, local-style advice for pacing, neighborhoods, and what to skip.",
    icon: Compass,
    opensAssistant: false,
  },
  {
    title: "Real-Time Travel Updates",
    description: "Current safety notes, events, and destination facts via live web search.",
    icon: Globe,
    opensAssistant: false,
  },
  {
    title: "Voice AI Assistant",
    description: "Chat by text or voice—your independent AI travel planner on demand.",
    icon: MessageCircle,
    opensAssistant: true,
  },
] as const;

const QUICK_ACTIONS = [
  { label: "Plan a trip", prompt: "Plan a 3-day trip to Cartagena" },
  {
    label: "Estimate budget",
    prompt:
      "Estimate my travel budget for 2 people, 3 nights, hotel 100 USD per night, food 40 USD per person per day",
  },
  {
    label: "Search recommendations",
    prompt: "Search current travel recommendations for Medellín",
  },
] as const;

const NAV_LINKS = [
  { label: "Destinations", href: "#destinations" },
  { label: "Planner", href: "#planner" },
  { label: "Guide Tips", href: "#guide-tips" },
  { label: "Contact", href: "#contact" },
] as const;

function FeaturedCarouselCard({
  destination,
  onAskTravelMate,
}: {
  destination: FeaturedDestination;
  onAskTravelMate: (prompt: string) => void;
}) {
  const [showExtra, setShowExtra] = useState(false);

  return (
    <article className="flex h-full w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-sm ring-1 ring-black/5">
      <div className="relative h-[200px] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes="(max-width: 640px) 90vw, 360px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <h3 className="absolute bottom-3 left-4 text-lg font-semibold tracking-tight text-white">
          {destination.name}
        </h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {destination.description}
        </p>
        <ul className="mt-3 space-y-1 text-xs text-foreground">
          {destination.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-2 text-xs">
          <div className="rounded-md border border-border/60 bg-background/50 px-3 py-2">
            <span className="text-muted-foreground">Best for</span>
            <p className="mt-0.5 line-clamp-2 font-medium">{destination.bestFor}</p>
          </div>
          <div className="rounded-md border border-border/60 bg-background/50 px-3 py-2">
            <span className="text-muted-foreground">Daily budget</span>
            <p className="mt-0.5 font-medium">{destination.budgetRange}</p>
          </div>
        </div>
        {showExtra && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Use the planner below to estimate costs, or ask TravelMate for a
            day-by-day itinerary tailored to your dates and style.
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <button
            type="button"
            onClick={() => setShowExtra((v) => !v)}
            className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            {showExtra ? "Hide details" : "View details"}
          </button>
          <button
            type="button"
            onClick={() => onAskTravelMate(destination.prompt)}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Ask TravelMate
          </button>
        </div>
      </div>
    </article>
  );
}

function FeaturedDestinationsCarousel({
  onAskTravelMate,
}: {
  onAskTravelMate: (prompt?: string) => void;
}) {
  return (
    <div className="relative mt-6 px-1 sm:px-10">
      <Carousel
        opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {FEATURED_DESTINATIONS.map((dest) => (
            <CarouselItem
              key={dest.name}
              className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
            >
              <FeaturedCarouselCard
                destination={dest}
                onAskTravelMate={onAskTravelMate}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 top-[100px] hidden border-border/60 bg-background/90 shadow-md sm:inline-flex" />
        <CarouselNext className="right-0 top-[100px] hidden border-border/60 bg-background/90 shadow-md sm:inline-flex" />
      </Carousel>
    </div>
  );
}

function CompactDestinationCard({
  destination,
  expanded,
  onToggleDetails,
  onAskTravelMate,
}: {
  destination: CompactDestination;
  expanded: boolean;
  onToggleDetails: () => void;
  onAskTravelMate: (prompt: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-border/60 bg-card/30">
      <div className="relative aspect-[3/2] w-full bg-muted">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <h3 className="absolute bottom-2 left-3 text-sm font-medium text-white">
          {destination.name}
        </h3>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">{destination.descriptor}</p>
        {expanded && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {destination.details}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onToggleDetails}
            className="text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
          >
            {expanded ? "Hide" : "View details"}
          </button>
          <button
            type="button"
            onClick={() => onAskTravelMate(destination.prompt)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Ask AI
          </button>
        </div>
      </div>
    </article>
  );
}

export function TravelDashboard({
  onAskTravelMate,
}: {
  onAskTravelMate: (prompt?: string) => void;
}) {
  const [compactExpanded, setCompactExpanded] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="TravelMate"
              className="h-16 w-auto max-w-[200px] bg-transparent object-contain sm:h-[4.5rem] sm:max-w-[240px]"
            />
          </a>
          <nav className="hidden items-center gap-5 text-xs text-muted-foreground md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => onAskTravelMate()}
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Ask TravelMate
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        {/* Hero */}
        <section className="relative min-h-[320px] overflow-hidden rounded-2xl border border-border/60 sm:min-h-[380px]">
          <Image
            src="/images/destinations/colombia.jpg"
            alt="Colombia landscapes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/55 sm:via-background/85 sm:to-background/30" />
          <div className="relative flex h-full min-h-[320px] flex-col justify-end px-6 py-10 sm:min-h-[380px] sm:max-w-xl sm:px-10">
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
              Independent AI Travel Planner
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Plan smarter trips across Colombia
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Plan your own trips with AI, local-style guidance, budget estimates,
              and real-time travel information.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAskTravelMate(prompt)}
                  className="rounded-full border border-border/60 bg-background/90 px-4 py-2 text-xs font-medium backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured destinations */}
        <section className="mt-14" id="destinations">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Featured destinations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hand-picked highlights with local-style planning context.
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              AI-powered travel planner
            </span>
          </div>
          <FeaturedDestinationsCarousel onAskTravelMate={onAskTravelMate} />
        </section>

        {/* Explore more */}
        <section className="mt-14">
          <h2 className="text-base font-semibold">Explore more destinations</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Compact picks for nature, cities, and off-the-beaten-path regions.
          </p>
          <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {MORE_DESTINATIONS.map((dest) => (
              <CompactDestinationCard
                key={dest.name}
                destination={dest}
                expanded={compactExpanded === dest.name}
                onToggleDetails={() =>
                  setCompactExpanded((c) => (c === dest.name ? null : dest.name))
                }
                onAskTravelMate={onAskTravelMate}
              />
            ))}
          </div>
        </section>

        {/* Travel planning tools */}
        <section className="mt-14" id="planner">
          <h2 className="text-base font-semibold">Travel planning tools</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Everything you need to plan independently—open the AI assistant when
            you are ready.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLANNING_TOOLS.map(({ title, description, icon: Icon, opensAssistant }) => (
              <div
                key={title}
                className={cn(
                  "rounded-xl border border-border/60 bg-card/50 p-4",
                  opensAssistant && "ring-1 ring-primary/20",
                )}
              >
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="mt-2 text-sm font-medium">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                {opensAssistant ? (
                  <button
                    type="button"
                    onClick={() => onAskTravelMate()}
                    className="mt-3 rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:opacity-90"
                  >
                    Open assistant
                  </button>
                ) : (
                  <p className="mt-3 text-[10px] text-muted-foreground">
                    Browse destinations above or use quick actions in the hero.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Guide tips */}
        <section
          className="mt-14 rounded-2xl border border-border/60 bg-card/30 p-6 sm:p-8"
          id="guide-tips"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-base font-semibold">Local guide tips</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                TravelMate shares practical, local-style advice—not a tour package.
                Ask about pacing, neighborhoods, budgets, and what to book ahead.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-foreground">
                <li>· Start with one region per week—Colombia rewards slow routes.</li>
                <li>· Use the budget planner before booking flights and hotels.</li>
                <li>· Search live updates for safety and seasonal events.</li>
              </ul>
              <button
                type="button"
                onClick={() =>
                  onAskTravelMate(
                    "Give me local-style tips for planning my first trip to Colombia",
                  )
                }
                className="mt-5 rounded-full border border-border/60 px-4 py-2 text-xs font-medium transition-colors hover:bg-muted"
              >
                Ask for guide tips
              </button>
            </div>
          </div>
        </section>

        {/* Real-time updates callout */}
        <section className="mt-10 flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-background/50 p-5">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-medium">Real-time travel updates</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Web search pulls current destination information when you ask
              TravelMate—useful for events, safety notes, and seasonal advice.
            </p>
          </div>
        </section>

      </main>

      <footer
        id="contact"
        className="mt-auto border-t border-border/60 bg-muted/25"
      >
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-3 text-center sm:pb-7 sm:pt-4">
          <div className="mx-auto flex max-w-2xl items-center gap-4 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="TravelMate"
              className="h-12 w-auto shrink-0 bg-transparent object-contain sm:h-14"
            />
            <p className="text-sm leading-snug text-muted-foreground">
              Plan your own trips with AI, local-style guidance, budget estimates,
              and real-time travel information.
            </p>
          </div>
          <ul className="mx-auto mt-3 flex max-w-sm flex-col items-center gap-1.5 text-sm leading-tight text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <a
                href="mailto:info@travelmate.com"
                className="transition-colors hover:text-foreground"
              >
                info@travelmate.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span>Medellín, Colombia</span>
            </li>
          </ul>
          <p
            className="mt-4 text-[10px] leading-tight text-muted-foreground"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} TravelMate · Independent AI travel planner
          </p>
        </div>
      </footer>
    </div>
  );
}
