# TravelMate VoiceAgent — Technical Implementation Plan

> **Source of truth:** [`assessment-requirements.md`](./assessment-requirements.md)  
> This document describes *how* we will implement the assessment. It does not replace the official requirements.

---

## 1. Project Goal

Build **TravelMate VoiceAgent**, a multimodal AI **travel planning assistant** for a travel agency. Users interact via text or voice; the agent answers in the selected mode, remembers recent context, and autonomously invokes real tools (calculator for budgets, web search for destination information) when helpful. The UI clearly shows when a tool was used versus a direct LLM reply.

**Success criteria:** A single-command local run (or public URL), demonstrable tools, persistent tool indicators in chat history, working text/voice modes, and documentation that lets a reviewer install and verify everything from scratch.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js UI)                      │
│  Chat history · Text input · Text/Voice toggle · Tool badges    │
│  Audio player (voice mode)                                       │
│  lib/chat-api.ts → mock OR POST /api/chat                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (App Router)                │
│  POST /api/chat  → agent loop, tools, memory trim                │
│  POST /api/tts   → OpenAI TTS → audio stream/URL                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   OpenAI Chat API      Tavily Search API   OpenAI TTS API
   (agent + tools)      (web search tool)   (voice responses)
```

**Stack choice:** Next.js 14+ (App Router) + TypeScript — one repo, one `npm run dev`, API keys only on the server.

**Out of scope for v1:** Authentication, database, user accounts, n8n (unless added later as optional export).

---

## 3. Frontend Responsibilities

| Area | Responsibility |
|------|----------------|
| **Chat UI** | Message list (user / assistant), scrollable history, send on Enter/button |
| **Input** | Controlled text field, disabled state while agent is processing |
| **Response mode** | Visible toggle: **Text** vs **Voice**; value sent with each message |
| **Tool visualization** | When assistant message includes tool usage metadata, render persistent badge (Calculator, Web Search) |
| **Direct replies** | Itineraries and general advice without tool metadata — no badge |
| **Voice mode** | Mock or TTS audio via `audioUrl` / `/api/tts` |
| **Loading states** | “TravelMate is thinking…” indicator |
| **Session** | Single browser session; conversation state in React state |
| **Branding** | TravelMate VoiceAgent copy; sidebar examples: Budget estimate, Destination search, Travel itinerary |

**Current status:** UI shell + `lib/chat-api.ts` + travel mock data in `lib/mock-chat.ts`. No layout/color redesign.

---

## 4. Backend Responsibilities

| Area | Responsibility |
|------|----------------|
| **`POST /api/chat`** | Accept `{ messages, responseMode }`, trim to last 7 user+assistant turns, call OpenAI with tools, return assistant message + tool metadata for UI |
| **`POST /api/tts`** | Accept `{ text }`, call OpenAI TTS, return `audio/mpeg` (or base64 JSON if frontend prefers) |
| **Secrets** | Read `OPENAI_API_KEY`, `TAVILY_API_KEY` from `process.env` only |
| **Tool execution** | Run calculator locally; call Tavily for web search |
| **Error handling** | Return structured errors (4xx/5xx) without leaking keys |
| **No persistence** | In-memory conversation from client payload; no DB |

---

## 5. AI Agent Responsibilities

| Area | Responsibility |
|------|----------------|
| **Model** | OpenAI model with function/tool calling (e.g. `gpt-4o-mini` or `gpt-4o`) |
| **System prompt** | Travel advisor role, tone, tool rules — see `lib/systemPrompt.ts` (≥5 instructions) |
| **Tool routing** | Model decides direct itinerary/advice vs `calculator` / `web_search` |
| **Memory** | Server trims `messages` to **last 7** user/assistant messages before each request |
| **Response assembly** | Final natural-language answer after tool results are injected |
| **Metadata for UI** | Map to `Message.tool` with names **Calculator** and **Web Search** for badges |

**Agent loop (high level):**

1. Receive trimmed history + user message  
2. Call model with tool definitions  
3. If tool calls → execute → append tool results → call model again (cap iterations, e.g. 3)  
4. Return final assistant text + tool metadata for the frontend  

---

## 6. Memory Strategy (Last 7 Messages)

- **Definition:** 7 alternating user/assistant entries in the active session.
- **Implementation:** Slice client `messages` to the last 7 where `role` is `user` or `assistant` (also done client-side in `buildChatHistory` for the request payload).
- **System prompt:** Not counted toward the 7; sent on every request separately.
- **Client:** `lib/chat-api.ts` sends trimmed history; server re-trims as authoritative rule.

---

## 7. Tools Strategy

### 7.1 Calculator Tool

| Field | Value |
|-------|--------|
| **Name** | `calculator` |
| **Purpose** | Trip budgets, per-night totals, per-person daily costs, transport |
| **Parameters** | `expression: string` — sanitized arithmetic |
| **Execution** | Safe evaluation (whitelist `0-9+-*/().`) |
| **Example triggers** | *"Calculate a trip budget for 2 people, 3 nights, $120/night…"* |

### 7.2 Web Search Tool

| Field | Value |
|-------|--------|
| **Name** | `web_search` |
| **Purpose** | Current destination recommendations, events, safety, visa updates |
| **Parameters** | `query: string`, optional `maxResults` (default 3) |
| **Execution** | Tavily API via `TAVILY_API_KEY` |
| **Example triggers** | *"Search current travel recommendations for Medellín"* |

### 7.3 Agent Autonomy

- Tools registered in OpenAI function format in `lib/tools.ts`.
- Descriptions steer the model: itineraries and general tips → direct reply; exact budgets → calculator; time-sensitive destination facts → web_search.

---

## 8. Tool Visualization Strategy (UI)

**Requirement:** Differentiate tool-assisted vs direct replies; indicator **persists in chat history**.

**Message shape (implemented in `lib/types.ts`):**

```ts
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool?: { name: "Calculator" | "Web Search"; input?: string; output?: string };
  audioUrl?: string;
};
```

**UI patterns:**

- **With tools:** Assistant bubble + `ToolBadge` chip (Calculator / Web Search).
- **Without tools:** Standard assistant bubble (e.g. Cartagena 3-day plan).
- **History:** Badges stored on the message object.

---

## 9. Text vs Voice Response Flow

```
User sends message + responseMode
        │
        ▼
   lib/chat-api.ts (mock) OR POST /api/chat
        │
        ├── responseMode === "text"
        │         └── Render text in chat (done)
        │
        └── responseMode === "voice"
                  └── audioUrl (mock) OR POST /api/tts { text }
                            └── <audio> play via VoicePlayer
```

---

## 10. TTS Integration Plan

| Item | Decision |
|------|----------|
| **Provider** | OpenAI TTS (`OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE` from env) |
| **Endpoint** | `POST /api/tts` |
| **Request** | `{ text: string }` — truncate if over limits |
| **Response** | `audio/mpeg` stream or URL |
| **Frontend** | `VoicePlayer` component on assistant messages with `audioUrl` |
| **Errors** | Fallback: text-only message if TTS fails |

---

## 11. Optional RAG Phase (Only If Time Allows)

| Step | Action |
|------|--------|
| 1 | Configurable `RAG_SOURCE_URL` (travel agency site or tourism board) |
| 2 | Fetch + extract text |
| 3 | Chunk, embed with OpenAI |
| 4 | Store in Chroma or FAISS |
| 5 | Inject top-k chunks for agency packages, policies, or destination pages |
| 6 | Document URL in README |

**Suggested sources:** Agency FAQ/packages page, or official destination board (e.g. national tourism site).

---

## 12. Implementation Phases

| Phase | Focus | Deliverable |
|-------|--------|-------------|
| **0** | Docs + env + gitignore | Plan, README, `.env.example` ✅ |
| **1** | UI shell + travel copy + mocks | Runnable chat, travel examples ✅ |
| **1b** | `lib/chat-api.ts` client layer | Mock/live switch ✅ |
| **2** | System prompt + tool schemas | `lib/systemPrompt.ts` ✅, `lib/tools.ts` |
| **3** | `/api/chat` agent loop + memory trim | Working agent |
| **4** | Calculator + Tavily execution | Verifiable tools in chat |
| **5** | Tool badges | Already in UI ✅ |
| **6** | `/api/tts` + voice mode | Real TTS |
| **7** | Polish + README test paths | Demo script |
| **8** *(optional)* | RAG pipeline | Bonus criteria |

---

## 13. Acceptance Checklist (Aligned with Assessment)

| # | Criterion | How to verify |
|---|-----------|----------------|
| 1 | App runs and shows chat UI | `npm run dev` → travel-themed chat |
| 2 | Text/voice selector changes behavior | Toggle → text vs audio player |
| 3 | Agent coherent with 7-message context | Multi-turn trip planning within window |
| 4 | Calculator tool works | Trip budget question → correct total + badge |
| 5 | Web search tool works | Destination search → summary + badge |
| 6 | System prompt ≥ 5 instructions | `lib/systemPrompt.ts` |
| 7 | UI differs tool vs direct replies | Cartagena plan = no badge; budget = Calculator |
| 8 | Tool indicator persists | Scroll up — badges visible |
| 9 | Voice mode produces playable audio | Voice mode message with player |
| 10 | No hardcoded API keys | Grep repo |
| 11 | README install/run from scratch | Fresh clone |
| 12 | Code + docs in English | Review |
| 13 | Technical decisions explainable | README section |

---

## 14. Recommended Backend Structure

```
app/
  api/
    chat/route.ts
    tts/route.ts
lib/
  chat-api.ts       # ✅ Client: mock vs /api/chat
  mock-chat.ts      # ✅ Travel mock data + sendMockMessage
  systemPrompt.ts   # ✅ Travel advisor prompt
  openai.ts
  tools.ts
  types.ts          # ✅ Message, ResponseMode, ToolName
```

| File | Responsibility |
|------|----------------|
| **`app/api/chat/route.ts`** | Validate body, trim to 7 messages, agent + tools, return `{ message }` mapped to `Message` |
| **`app/api/tts/route.ts`** | Text → audio bytes |
| **`lib/openai.ts`** | OpenAI client singleton |
| **`lib/tools.ts`** | `calculator`, `web_search` schemas + executors |
| **`lib/systemPrompt.ts`** | `SYSTEM_PROMPT` for travel agency assistant |
| **`lib/chat-api.ts`** | `sendAgentMessage`, `buildChatHistory` |

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Tool loop runaway | Max 3 model iterations per user message |
| Unsafe calculator | Whitelist characters; reject otherwise |
| Tavily quota/errors | Friendly assistant message; optional error badge |
| Large TTS input | Truncate text |
| Time pressure (4h) | Mock mode + copy first; `/api/chat` minimal viable path |

---

## 16. References

- Official requirements: [`assessment-requirements.md`](./assessment-requirements.md)
- User-facing setup: [`../README.md`](../README.md)
- Environment template: [`../.env.example`](../.env.example)
