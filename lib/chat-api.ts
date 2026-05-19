import { sendMockMessage } from "./mock-chat";
import type { Message, ResponseMode, ToolUsage } from "./types";

export type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatApiResponse = {
  message: {
    content: string;
    tool?: ToolUsage;
    audioUrl?: string;
  };
};

function isMockChatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_CHAT === "true";
}

function mapApiResponseToMessage(data: ChatApiResponse): Message {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: data.message.content,
    timestamp: Date.now(),
    tool: data.message.tool,
    audioUrl: data.message.audioUrl,
  };
}

async function fetchChatApi(params: {
  messages: ChatHistoryMessage[];
  responseMode: ResponseMode;
}): Promise<Message> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = (await res.json()) as { error?: string; message?: string };
      detail = err.error ?? err.message ?? detail;
    } catch {
      // response body was not JSON
    }
    throw new Error(`Chat API failed (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as ChatApiResponse;
  if (!data?.message?.content) {
    throw new Error("Chat API returned an invalid response");
  }

  return mapApiResponseToMessage(data);
}

/** Last 7 user/assistant turns with only role and content. */
export function buildChatHistory(messages: Message[]): ChatHistoryMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map(({ role, content }) => ({ role, content }))
    .slice(-7);
}

export async function sendAgentMessage(params: {
  messages: ChatHistoryMessage[];
  responseMode: ResponseMode;
}): Promise<Message> {
  if (isMockChatEnabled()) {
    const lastUser = [...params.messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      throw new Error("No user message in chat history");
    }
    return sendMockMessage(lastUser.content, params.responseMode);
  }

  return fetchChatApi(params);
}
