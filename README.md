# TravelMate VoiceAgent

A **multimodal AI travel planning assistant** for a travel agency. TravelMate helps clients plan trips, estimate budgets, and find up-to-date destination information—through a conversational web interface with **text or voice** responses and transparent **tool usage** indicators.

Built as the RIWI **Automatización con IA** performance assessment: a conversational agent with real tools, session memory, and optional RAG (bonus).

> Official requirements: [`docs/assessment-requirements.md`](docs/assessment-requirements.md)  
> Implementation plan: [`docs/technical-plan.md`](docs/technical-plan.md)

---

## Use Case

**TravelMate VoiceAgent** acts as an AI travel advisor for agency clients:

- Suggests **itineraries** and day-by-day plans for cities and regions.
- Runs **budget estimates** (hotel nights, per-person food, transport) via the calculator tool.
- Performs **web search** for current destination recommendations, events, and safety notes.
- Responds in **text** or **synthesized voice**, based on user preference.

The agent chooses tools autonomously; the UI shows when a tool was used versus a direct answer.

---

## Features

- 💬 **Conversational travel planning** with full chat history
- 🧠 **Session memory** — last **7** user/assistant messages for context
- 🔧 **Two tools:** Calculator (trip budgets) and Web Search (Tavily)
- 🏷️ **Visible tool usage indicators** persisted in chat history
- 📝 **Text mode** — standard message bubbles
- 🔊 **Voice mode** — OpenAI TTS with in-browser playback
- 🔒 **Server-side API keys** — no secrets in the client
- 📄 **English documentation** and `.env.example` for setup
- 🔍 **Optional RAG** (bonus) — retrieval over a travel agency site or travel information URL

---

## Architecture Overview

```
Browser (Next.js + React)
    │  chat UI, text/voice toggle, tool badges, audio player
    ▼
Next.js API Routes
    ├── POST /api/chat  → OpenAI agent + tools + 7-msg memory
    └── POST /api/tts     → OpenAI text-to-speech
    ▼
External APIs: OpenAI (chat + TTS), Tavily (search)
```

Client layer: `lib/chat-api.ts` (mock mode via `NEXT_PUBLIC_USE_MOCK_CHAT` or live `/api/chat` when implemented).

See [`docs/technical-plan.md`](docs/technical-plan.md) for phased implementation and file layout.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React + shadcn/ui components |
| Agent | OpenAI Chat Completions with function calling |
| Web search | Tavily API |
| TTS | OpenAI TTS (`gpt-4o-mini-tts`) |
| Styling | Tailwind CSS |

No database or authentication in the base scope.

---

## Tools

### 1. Calculator (`calculator`)

| Property | Description |
|----------|-------------|
| **Purpose** | Exact math for travel budgets and fares |
| **Parameters** | `expression` (string) — sanitized arithmetic expression |
| **Example** | *"Calculate a trip budget for 2 people, 3 nights, $120/night hotel…"* |

### 2. Web Search (`web_search`)

| Property | Description |
|----------|-------------|
| **Purpose** | Current destination information from the web |
| **Parameters** | `query` (string); optional `maxResults` (number, default 3) |
| **Provider** | Tavily |
| **Example** | *"Search current travel recommendations for Medellín"* |

Both tools are defined in `lib/tools.ts` (to be implemented). The model decides when to invoke them.

---

## Response Modes

| Mode | Behavior |
|------|----------|
| **Text** | Assistant reply appears as a normal chat message |
| **Voice** | Same text plus audio from `/api/tts`, played via the in-chat audio player |

The user can switch modes at any time; the next message uses the selected mode.

---

## Setup

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- OpenAI API key
- Tavily API key

### 1. Clone and install

```bash
git clone <your-repo-url>
cd VoiceAgent
npm install
```

### 2. Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_USE_MOCK_CHAT` | No | `true` = mock replies (no backend); `false` = call `/api/chat` |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for chat and TTS |
| `TAVILY_API_KEY` | Yes* | Tavily API key for web search tool |
| `OPENAI_TTS_MODEL` | No | Default: `gpt-4o-mini-tts` |
| `OPENAI_TTS_VOICE` | No | Default: `alloy` |

\*Required when implementing the real backend; mock mode works without keys for UI demos.

Never commit `.env` or `.env.local`. Only `.env.example` belongs in the repo.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With `NEXT_PUBLIC_USE_MOCK_CHAT=true`, the chat UI runs with travel-themed sample history and simulated tool responses.

---

## How to Test Required Features

Use this checklist before delivery (maps to assessment rubric):

1. **Chat UI** — App loads; travel-themed history and input work.
2. **Text/Voice toggle** — Switch modes; voice shows audio player, text does not require TTS.
3. **Memory (7 messages)** — In one session, reference an earlier destination or budget within ~7 turns.
4. **Calculator** — Ask for a trip budget with clear numbers — badge shows `Calculator`, correct total.
5. **Web search** — Ask: *"Search current travel recommendations for Medellín"* — badge shows `Web Search`.
6. **Direct reply** — Ask: *"I want to travel to Cartagena for 3 days"* — itinerary without tool badge.
7. **Tool history** — Scroll up; tool badges remain on old messages.
8. **System prompt** — Open `lib/systemPrompt.ts`; confirm ≥5 distinct instructions.
9. **Secrets** — `git grep -i sk-` and search for hardcoded keys; none in repo.
10. **Fresh install** — Clone in a clean folder, follow README only.

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js full-stack** | Single repo, one dev command, API keys stay on server |
| **OpenAI function calling** | Native tool routing without extra agent framework for v1 |
| **Tavily for search** | Simple API, good for current destination facts |
| **7-message server-side trim** | Matches rubric; single source of truth |
| **Client `lib/chat-api.ts`** | Swaps mock vs live API without UI changes |
| **Tool metadata in API response** | Persistent UI badges (`Calculator`, `Web Search`) |
| **Separate `/api/tts`** | Voice can be retried without re-running the agent |
| **Travel agency use case** | Clear demo narrative for assessment reviewers |

---

## Future Improvements

- Implement `POST /api/chat` and `POST /api/tts` with real OpenAI + Tavily
- Streaming assistant tokens for lower perceived latency
- Rate limiting and request validation middleware
- Deploy to Vercel with environment variables in dashboard
- Export trip plan as Markdown or PDF

---

## Optional RAG (Bonus)

If time allows, add retrieval over a travel-focused source:

1. Set `RAG_SOURCE_URL` in `.env.local` (travel agency website or official tourism board URL).
2. Fetch content, chunk, embed with OpenAI.
3. Store vectors in Chroma or FAISS locally.
4. Inject top-k chunks into context for agency-specific policies, packages, or destination pages.

Example candidate URLs: your agency’s FAQ page, or [Colombia Travel](https://www.colombia.travel/en) for destination facts.

This section is **not required** for the base assessment pass.

---

## Project Structure

```
app/
  page.tsx
  layout.tsx
  api/chat/route.ts   # (planned)
  api/tts/route.ts    # (planned)
components/voice-agent/
lib/
  chat-api.ts
  mock-chat.ts
  systemPrompt.ts
  types.ts
  tools.ts            # (planned)
docs/
  assessment-requirements.md
  technical-plan.md
```

---

## License & Delivery

- Deliverable: `nombre-apellido-voiceagent.zip` including full source + public GitHub repo.
- All code and documentation in **English**.
- Explain technical decisions during the oral defense (*sustentación*).

---

## Author

RIWI — Automatización con IA · Individual performance test
