import { getOpenAIClient } from "./openai";

const MAX_TTS_CHARS = 4096;

export function getTTSModel(): string {
  return process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
}

export function getTTSVoice(): string {
  return process.env.OPENAI_TTS_VOICE ?? "alloy";
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
    response_format: "mp3",
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
