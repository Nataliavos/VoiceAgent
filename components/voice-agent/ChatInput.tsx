"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

const VOICE_SEND_DELAY_MS = 450;

export function ChatInput({
  onSend,
  disabled,
  draft,
  onDraftConsumed,
  compact = false,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
  draft?: string;
  onDraftConsumed?: () => void;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [speechHint, setSpeechHint] = useState(false);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const disabledRef = useRef(disabled);
  const pendingSendRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceSessionRef = useRef(false);
  const voiceFinalHandledRef = useRef(false);

  const {
    supported,
    listening,
    error: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  disabledRef.current = disabled;

  const clearPendingSend = useCallback(() => {
    if (pendingSendRef.current) {
      clearTimeout(pendingSendRef.current);
      pendingSendRef.current = null;
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  useEffect(() => {
    if (draft) {
      setValue(draft);
      onDraftConsumed?.();
      ref.current?.focus();
    }
  }, [draft, onDraftConsumed]);

  useEffect(() => {
    if (disabled && listening) {
      voiceSessionRef.current = false;
      voiceFinalHandledRef.current = false;
      clearPendingSend();
      stopListening();
    }
  }, [disabled, listening, stopListening, clearPendingSend]);

  useEffect(() => clearPendingSend, [clearPendingSend]);

  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || disabledRef.current) return false;
      onSend(trimmed);
      setValue("");
      return true;
    },
    [onSend],
  );

  const submit = () => {
    clearPendingSend();
    voiceSessionRef.current = false;
    voiceFinalHandledRef.current = false;
    submitText(value);
  };

  const scheduleVoiceSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      clearPendingSend();
      setValue(trimmed);

      pendingSendRef.current = setTimeout(() => {
        pendingSendRef.current = null;
        voiceSessionRef.current = false;
        submitText(trimmed);
      }, VOICE_SEND_DELAY_MS);
    },
    [clearPendingSend, submitText],
  );

  const handleFinalTranscript = useCallback(
    (text: string) => {
      if (!voiceSessionRef.current || voiceFinalHandledRef.current) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      voiceFinalHandledRef.current = true;
      stopListening();
      scheduleVoiceSend(trimmed);
    },
    [stopListening, scheduleVoiceSend],
  );

  const toggleMic = () => {
    if (!supported) {
      setSpeechHint(true);
      return;
    }
    if (listening) {
      voiceSessionRef.current = false;
      voiceFinalHandledRef.current = false;
      clearPendingSend();
      stopListening();
      return;
    }
    setSpeechHint(false);
    clearPendingSend();
    voiceSessionRef.current = true;
    voiceFinalHandledRef.current = false;
    startListening({
      onInterim: (interim) => {
        setValue(interim);
      },
      onFinal: handleFinalTranscript,
    });
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/80 backdrop-blur">
      <div
        className={cn(
          "mx-auto w-full",
          compact ? "px-3 py-2.5" : "max-w-3xl px-4 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-colors",
            listening
              ? "border-primary/50 ring-1 ring-primary/25"
              : "border-border/60 focus-within:border-ring/60",
          )}
        >
          <div className="flex shrink-0 flex-col items-center gap-1">
            <button
              type="button"
              onClick={toggleMic}
              disabled={disabled}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                listening
                  ? "animate-pulse border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {listening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            {supported && !compact && (
              <span className="max-w-[4.75rem] text-center text-[9px] leading-tight text-muted-foreground">
                {listening
                  ? "Listening…"
                  : "Speak and I'll send it automatically"}
              </span>
            )}
          </div>
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              listening ? "Listening…" : "Message TravelMate…"
            }
            rows={1}
            readOnly={listening}
            className={cn(
              "max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground",
              listening && "cursor-default",
            )}
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim() || listening}
            aria-label="Send message"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
        {!compact && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Enter to send · Shift + Enter for new line
            {listening ? " · Finish speaking to send" : ""}
          </p>
        )}
        {speechHint && !supported && (
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Speech input is not supported in this browser. Use Chrome or Edge for
            voice typing.
          </p>
        )}
        {speechError && (
          <p className="mt-1 text-center text-[10px] text-destructive">
            {speechError}
          </p>
        )}
      </div>
    </div>
  );
}
