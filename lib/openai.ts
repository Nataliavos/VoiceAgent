import OpenAI from "openai";

let client: OpenAI | null = null;

/** Server-only OpenAI client. Never import from client components. */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}
