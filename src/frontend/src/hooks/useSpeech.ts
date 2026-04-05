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
      if (!synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = companion.speechRate;
      utterance.pitch = companion.speechPitch;
      utterance.volume = 1;

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
        if (onEnd) utterance.onend = onEnd;
        try {
          synthRef.current?.speak(utterance);
        } catch {
          // graceful degrade
          onEnd?.();
        }
      };

      // Voices may not be loaded yet — wait for them
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        synthRef.current.addEventListener("voiceschanged", doSpeak, {
          once: true,
        });
        // Fallback: if voiceschanged never fires, speak anyway after 500ms
        setTimeout(() => {
          if (!utterance.voice) doSpeak();
        }, 500);
      }
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
  const resultReceivedRef = useRef(false);
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
        resultReceivedRef.current = false;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = event.results[0]?.[0]?.transcript ?? "";
          if (transcript) {
            resultReceivedRef.current = true;
            onResult(transcript);
          }
        };

        // CRITICAL: onend fires when recognition stops (whether or not a result was received)
        // Without this, the app hangs in "Listening..." state forever
        recognition.onend = () => {
          if (!resultReceivedRef.current) {
            onError?.();
          }
        };

        recognition.onerror = (event) => {
          // "aborted" fires when we manually call stop() — ignore that
          if (event.error !== "aborted") {
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
