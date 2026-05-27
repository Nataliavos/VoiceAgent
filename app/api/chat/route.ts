import { NextResponse } from "next/server";
import type {
  EasyInputMessage,
  Response,
  ResponseFunctionToolCall,
  ResponseInputItem,
} from "openai/resources/responses/responses";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { generateSpeechBase64, toAudioDataUrl } from "@/lib/tts";
import { executeTool, OPENAI_TOOLS } from "@/lib/tools";
import type { ResponseMode, ToolUsage } from "@/lib/types";

const MAX_TOOL_ITERATIONS = 3;

type ChatRequestBody = {
  messages?: Array<{ role?: string; content?: string }>;
  responseMode?: ResponseMode;
};

type ChatMessagePayload = {
  role: "user" | "assistant";
  content: string;
};

function isValidRole(role: string): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

function trimMessages(
  messages: ChatMessagePayload[],
): ChatMessagePayload[] {
  return messages.slice(-7);
}

function toInputMessages(messages: ChatMessagePayload[]): EasyInputMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

function getFunctionCalls(
  response: Response,
): ResponseFunctionToolCall[] {
  return (response.output ?? []).filter(
    (item): item is ResponseFunctionToolCall => item.type === "function_call",
  );
}

function extractAssistantText(response: Response): string {
  const parts: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type === "message") {
      for (const block of item.content) {
        if (block.type === "output_text" && block.text) {
          parts.push(block.text);
        }
      }
    }
  }
  return parts.join("\n").trim();
}

const TRAVEL_TOPIC_HINTS =
  /\b(travel|trip|itinerary|destination|flight|hotel|hostel|booking|airline|airport|visa|passport|tour|attraction|weather|safety|transport|bus|train|budget|vacation|holiday|journey|tourism|turismo|viaje|itinerario|destino|vuelo|hotel|hospedaje|reserva|aerolinea|aeropuerto|visa|pasaporte|tour|atraccion|clima|seguridad|transporte|bus|tren|presupuesto|vacaciones)\b/i;
const NON_TRAVEL_HINTS =
  /\b(therapist|therapy|psychologist|psychiatrist|depressed|depression|anxiety|lawyer|attorney|doctor|clinic|hospital|medical|diagnosis|exam answers|homework|coding interview|debug this code|psicolog|terapeut|psiquiatra|triste|depresion|ansiedad|abogad|medic|doctor|clinica|hospital|diagnostico|tarea|examen)\b/i;
const GREETING_ONLY =
  /^(hi|hello|hey|hola|buenas|good morning|good afternoon|good evening|buenos dias|buenas tardes|buenas noches)[!. ]*$/i;

function detectSpanish(text: string): boolean {
  return /[¿¡]|\b(hola|gracias|viaje|viajar|destino|presupuesto|ayuda|quiero|necesito)\b/i.test(
    text,
  );
}

function buildOutOfScopeReply(userText: string): string {
  if (detectSpanish(userText)) {
    return "Solo puedo ayudar con temas de viajes (destinos, itinerarios, presupuesto, transporte, seguridad turistica y requisitos de viaje). Si quieres, te ayudo a planear tu proximo viaje.";
  }
  return "I can only help with travel-related topics (destinations, itineraries, budgets, transportation, travel safety, and trip requirements). If you want, I can help you plan your next trip.";
}

function isTravelInScope(userText: string): boolean {
  const text = userText.trim();
  if (!text) return true;
  if (GREETING_ONLY.test(text)) return true;
  if (NON_TRAVEL_HINTS.test(text)) return false;
  return TRAVEL_TOPIC_HINTS.test(text);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    if (body.responseMode !== "text" && body.responseMode !== "voice") {
      return NextResponse.json(
        { error: "responseMode must be text or voice" },
        { status: 400 },
      );
    }

    const parsed: ChatMessagePayload[] = [];
    for (const m of body.messages) {
      if (!m?.role || !isValidRole(m.role) || typeof m.content !== "string") {
        return NextResponse.json(
          { error: "Each message must have role user|assistant and string content" },
          { status: 400 },
        );
      }
      const content = m.content.trim();
      if (!content) continue;
      parsed.push({ role: m.role, content });
    }

    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "At least one non-empty message is required" },
        { status: 400 },
      );
    }

    const messages = trimMessages(parsed);
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage && !isTravelInScope(lastUserMessage.content)) {
      return NextResponse.json({
        message: {
          content: buildOutOfScopeReply(lastUserMessage.content),
          tool: null,
          audioUrl: null,
        },
      });
    }

    const client = getOpenAIClient();
    const model = getOpenAIModel();

    let response = await client.responses.create({
      model,
      instructions: SYSTEM_PROMPT,
      input: toInputMessages(messages),
      tools: OPENAI_TOOLS,
    });

    let lastToolUsage: ToolUsage | null = null;
    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      const functionCalls = getFunctionCalls(response);
      if (functionCalls.length === 0) break;

      const toolOutputs: ResponseInputItem.FunctionCallOutput[] = [];

      for (const call of functionCalls) {
        const { output, usage } = await executeTool(call.name, call.arguments);
        if (usage) lastToolUsage = usage;
        toolOutputs.push({
          type: "function_call_output",
          call_id: call.call_id,
          output,
        });
      }

      response = await client.responses.create({
        model,
        previous_response_id: response.id,
        input: toolOutputs,
        tools: OPENAI_TOOLS,
      });

      iterations++;
    }

    const content = extractAssistantText(response);
    if (!content) {
      return NextResponse.json(
        { error: "Model returned an empty response" },
        { status: 502 },
      );
    }

    let audioUrl: string | null = null;
    if (body.responseMode === "voice") {
      try {
        const speech = await generateSpeechBase64(content);
        audioUrl = toAudioDataUrl(speech.audioBase64, speech.mimeType);
      } catch {
        // TTS failed — return text-only response
      }
    }

    return NextResponse.json({
      message: {
        content,
        tool: lastToolUsage,
        audioUrl,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
