import type { Companion } from "@/lib/companions";
import { useCallback, useRef } from "react";

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: {
        results: Array<Array<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export function useSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== "undefined" ? window.speechSynthesis : null,
  );

  const speak = useCallback(
    (text: string, companion: Companion, onEnd?: () => void) => {
      if (!synthRef.current) {
        onEnd?.();
        return;
      }
      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Small delay after cancel to avoid Chrome bug where speak() is silently ignored
      setTimeout(() => {
        if (!synthRef.current) {
          onEnd?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = companion.speechRate;
        utterance.pitch = companion.speechPitch;
        utterance.volume = 1;
        if (onEnd) utterance.onend = onEnd;

        // Chrome sometimes stalls -- resume if paused
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }

        const doSpeak = () => {
          const voices = synthRef.current?.getVoices() ?? [];
          const preferred = voices.find((v) =>
            companion.voiceGender === "female"
              ? v.name.toLowerCase().includes("female") ||
                v.name.toLowerCase().includes("woman") ||
                v.name.includes("Samantha") ||
                v.name.includes("Karen") ||
                v.name.includes("Moira") ||
                v.name.includes("Victoria")
              : v.name.toLowerCase().includes("male") ||
                v.name.includes("Daniel") ||
                v.name.includes("Alex") ||
                v.name.includes("Tom"),
          );
          if (preferred) utterance.voice = preferred;
          try {
            synthRef.current?.speak(utterance);
          } catch {
            onEnd?.();
          }
        };

        const voices = synthRef.current?.getVoices() ?? [];
        if (voices.length > 0) {
          doSpeak();
        } else {
          synthRef.current?.addEventListener("voiceschanged", doSpeak, {
            once: true,
          });
          // Fallback: if voiceschanged never fires, speak after 800ms
          setTimeout(() => {
            if (!synthRef.current?.speaking) {
              doSpeak();
            }
          }, 800);
        }
      }, 80);
    },
    [],
  );

  const stop = useCallback(() => {
    if (!synthRef.current) return;
    try {
      synthRef.current.cancel();
    } catch {
      // ignore
    }
  }, []);

  const isSpeaking = useCallback(() => {
    return synthRef.current?.speaking ?? false;
  }, []);

  return { speak, stop, isSpeaking };
}

export function useVoiceRecognition() {
  const recognitionRef = useRef<{ stop(): void } | null>(null);
  // Track whether we already dispatched the result to avoid double-firing
  const resultDispatchedRef = useRef(false);
  const isAvailable =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(
    (onResult: (transcript: string) => void, onError?: () => void) => {
      if (!isAvailable) {
        onError?.();
        return;
      }
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        onError?.();
        return;
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        resultDispatchedRef.current = false;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
          if (transcript && !resultDispatchedRef.current) {
            resultDispatchedRef.current = true;
            onResult(transcript);
          }
        };

        // onend fires AFTER onresult in all browsers.
        // Only call onError if no result was received.
        recognition.onend = () => {
          if (!resultDispatchedRef.current) {
            // No transcript was received -- treat as error/timeout
            onError?.();
          }
        };

        recognition.onerror = (event) => {
          // "aborted" fires when we manually call stop() -- safe to ignore
          if (event.error !== "aborted" && !resultDispatchedRef.current) {
            resultDispatchedRef.current = true; // prevent onend from also calling onError
            onError?.();
          }
        };

        recognition.start();
      } catch {
        onError?.();
      }
    },
    [isAvailable],
  );

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  return { startListening, stopListening, isAvailable };
}
