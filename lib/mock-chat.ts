import type { Message, ResponseMode, ToolUsage } from "./types";

// Public-domain short audio used as a mock for TTS playback.
const MOCK_AUDIO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/4/4f/Sample-12s.mp3";

const BUDGET_CALC_EXPR =
  "(120 * 3) + (40 * 2 * 3) + 80"; // hotel + food + transport

export const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm TravelMate, your AI travel assistant. How can I help you plan your next trip?",
  timestamp: 0,
};

/** Default chat history — single welcome message only. */
export const initialMessages: Message[] = [WELCOME_MESSAGE];

function detectTool(input: string): ToolUsage | undefined {
  const text = input.toLowerCase();
  if (
    /[0-9].*[\+\-\*\/x].*[0-9]/.test(text) ||
    text.includes("calculate") ||
    text.includes("budget") ||
    text.includes("estimate") ||
    (text.includes("usd") && (text.includes("night") || text.includes("per person")))
  ) {
    return { name: "Calculator", input };
  }
  if (
    text.startsWith("search") ||
    text.includes("recommendations") ||
    text.includes("destination") ||
    text.includes("look up") ||
    text.includes("current travel")
  ) {
    return { name: "Web Search", input };
  }
  return undefined;
}

function mockTravelBudgetAnswer(): string {
  return `Estimated trip budget for **2 people, 3 nights**:

| Item | Calculation | Subtotal |
|------|-------------|----------|
| Hotel | 3 nights × $120 | **$360** |
| Food | 2 people × 3 days × $40 | **$240** |
| Local transport | flat rate | **$80** |
| **Total** | | **$680 USD** |

This is a baseline estimate—add flights, insurance, and activities separately.`;
}

function mockAnswer(input: string, tool?: ToolUsage): string {
  if (tool?.name === "Calculator") {
    if (input.toLowerCase().includes("budget") || input.toLowerCase().includes("trip")) {
      return mockTravelBudgetAnswer();
    }
    try {
      const expr = input.replace(/[^-()\d/*+.]/g, "");
      // eslint-disable-next-line no-new-func
      const result = expr ? Function(`"use strict";return (${expr})`)() : "—";
      return `The estimated total is **${result} USD**.`;
    } catch {
      return "I tried to compute that budget but could not parse the numbers. Please list nights, rates, and per-person costs clearly.";
    }
  }
  if (tool?.name === "Web Search") {
    const query = input.replace(/^search\s+/i, "").trim() || input;
    return `Here's a quick summary based on current results for **${query}**:

- **Top sights** — Popular neighborhoods, guided tours, and seasonal events.
- **Getting around** — Metro, registered rides, and airport transfers.
- **Practical tips** — Booking windows, weather, and local safety guidance from recent sources.`;
  }
  const lower = input.toLowerCase();
  if (lower.includes("cartagena") || lower.includes("itinerary") || lower.includes("days")) {
    return `Here's a simple travel plan based on your request:

- **Day 1** — Explore the historic center and main landmarks.
- **Day 2** — Day trip or nature experience near the city.
- **Day 3** — Local culture, food, and departure prep.

Tell me your dates and budget if you want a more detailed itinerary.`;
  }
  return `Got it. You said: "${input}". I can help refine destinations, budgets, and day-by-day plans—ask for a budget estimate or destination search when you need live data.`;
}

/** Simulated assistant turn — returns after a short delay. */
export async function sendMockMessage(
  userInput: string,
  mode: ResponseMode,
): Promise<Message> {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
  const tool = detectTool(userInput);
  const toolMeta =
    tool?.name === "Calculator" && userInput.toLowerCase().includes("budget")
      ? { name: "Calculator" as const, input: BUDGET_CALC_EXPR, output: "680" }
      : tool;
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: mockAnswer(userInput, tool),
    timestamp: Date.now(),
    tool: toolMeta,
    audioUrl: mode === "voice" ? MOCK_AUDIO_URL : undefined,
  };
}
