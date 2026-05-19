import { initialMessages } from "@/lib/mock-chat";
import type { Message } from "@/lib/types";

export const CHAT_STORAGE_KEY = "travelmate-chat-history";
const MAX_STORED_MESSAGES = 7;

function isValidMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Message;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.timestamp === "number"
  );
}

/** Load up to the last 7 messages from localStorage, or the welcome message. */
export function loadStoredMessages(): Message[] {
  if (typeof window === "undefined") return initialMessages;

  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return initialMessages;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialMessages;

    const valid = parsed.filter(isValidMessage).slice(-MAX_STORED_MESSAGES);
    return valid.length > 0 ? valid : initialMessages;
  } catch {
    return initialMessages;
  }
}

/** Persist only the last 7 messages (user + assistant). */
export function saveStoredMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;

  try {
    const toStore = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function clearStoredMessages(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_STORAGE_KEY);
}
