"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearStoredMessages,
  loadStoredMessages,
  saveStoredMessages,
} from "@/lib/chat-storage";
import { initialMessages } from "@/lib/mock-chat";
import type { Message } from "@/lib/types";

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setMessages(loadStoredMessages());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    saveStoredMessages(messages);
  }, [messages, storageReady]);

  const resetChat = useCallback(() => {
    clearStoredMessages();
    setMessages(initialMessages);
  }, []);

  return { messages, setMessages, resetChat };
}
