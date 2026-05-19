import { NextResponse } from "next/server";
import { generateSpeechBase64 } from "@/lib/tts";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };

    if (typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 },
      );
    }

    const { audioBase64, mimeType } = await generateSpeechBase64(body.text);

    return NextResponse.json({ audioBase64, mimeType });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "TTS generation failed";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
