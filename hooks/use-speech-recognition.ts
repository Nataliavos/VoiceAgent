"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: { 0: { transcript: string }; isFinal: boolean };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex?: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionCallbacks = {
  /** Live preview while the user is still speaking (not auto-sent). */
  onInterim?: (text: string) => void;
  /** Fired only when a result segment is marked final. */
  onFinal: (text: string) => void;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Pick Web Speech API lang from browser preferences (English or Spanish). */
export function getSpeechRecognitionLang(): string {
  if (typeof navigator === "undefined") return "en-US";

  const tags = [navigator.language, ...(navigator.languages ?? [])]
    .filter((t): t is string => Boolean(t))
    .map((t) => t.toLowerCase());

  for (const tag of tags) {
    if (!tag.startsWith("es")) continue;
    if (tag.includes("-co")) return "es-CO";
    if (tag.includes("-es") || tag === "es-es") return "es-ES";
    if (tag.includes("-")) return tag;
    return "es-CO";
  }

  return "en-US";
}

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(
    (callbacks: SpeechRecognitionCallbacks) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Speech input is not supported in this browser.");
        return;
      }

      if (listening) {
        stopListening();
        return;
      }

      setError(null);
      const recognition = new Ctor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getSpeechRecognitionLang();
      let accumulatedFinal = "";

      recognition.onresult = (event) => {
        let allFinal = "";
        let allInterim = "";

        for (let i = 0; i < event.results.length; i++) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            allFinal += segment;
          } else {
            allInterim += segment;
          }
        }

        if (allFinal.trim()) {
          accumulatedFinal = allFinal.trim();
        }

        const preview = (allFinal + allInterim).trim();
        if (allInterim && callbacks.onInterim && preview) {
          callbacks.onInterim(preview);
        } else if (accumulatedFinal && callbacks.onInterim) {
          callbacks.onInterim(accumulatedFinal);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
          setError("Microphone permission was denied.");
        } else if (event.error !== "aborted") {
          setError("Speech recognition failed. Try again.");
        }
        setListening(false);
        accumulatedFinal = "";
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
        const trimmed = accumulatedFinal.trim();
        accumulatedFinal = "";
        if (trimmed) {
          callbacks.onFinal(trimmed);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    },
    [listening, stopListening],
  );

  return {
    supported,
    listening,
    error,
    startListening,
    stopListening,
  };
}
