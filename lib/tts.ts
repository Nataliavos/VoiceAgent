import { getOpenAIClient } from "./openai";

const MAX_TTS_CHARS = 4096;
const DEFAULT_TTS_VOICE = "nova";
const DEFAULT_TTS_SPEED = 1.15;
const MIN_TTS_SPEED = 0.25;
const MAX_TTS_SPEED = 4.0;

const TTS_INSTRUCTIONS =
  "Speak with a warm, friendly, feminine Colombian Spanish tone. Keep the same voice and accent consistently across responses.";

export function getTTSModel(): string {
  return process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
}

/** Fixed voice for all responses — never inferred from user input. */
export function getTTSVoice(): string {
  const voice = process.env.OPENAI_TTS_VOICE?.trim();
  return voice || DEFAULT_TTS_VOICE;
}

export function getTTSInstructions(): string {
  return TTS_INSTRUCTIONS;
}

/** OpenAI TTS speed (0.25–4.0). Defaults to 1.15 for a slightly faster conversational pace. */
export function getTTSSpeed(): number {
  const raw = process.env.OPENAI_TTS_SPEED;
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_TTS_SPEED;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < MIN_TTS_SPEED || parsed > MAX_TTS_SPEED) {
    return DEFAULT_TTS_SPEED;
  }
  return parsed;
}

/** Server-only TTS helper. Never import from client components. */
export async function generateSpeechBase64(
  text: string,
): Promise<{ audioBase64: string; mimeType: string }> {
  const input = text.trim().slice(0, MAX_TTS_CHARS);
  if (!input) {
    throw new Error("Text is empty");
  }

  const client = getOpenAIClient();
  const response = await client.audio.speech.create({
    model: getTTSModel(),
    voice: getTTSVoice(),
    input,
    instructions: getTTSInstructions(),
    response_format: "mp3",
    speed: getTTSSpeed(),
  });

  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    audioBase64: buffer.toString("base64"),
    mimeType: "audio/mpeg",
  };
}

export function toAudioDataUrl(
  audioBase64: string,
  mimeType: string,
): string {
  return `data:${mimeType};base64,${audioBase64}`;
}
