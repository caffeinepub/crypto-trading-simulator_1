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

/**
 * Speak text using browser SpeechSynthesis.
 * Guarantees onEnd() is always called (via timeout fallback) so isSpeaking
 * never gets permanently stuck.
 */
function browserSpeak(
  text: string,
  companion: Companion,
  onEnd?: () => void,
): void {
  const synth = window.speechSynthesis;
  if (!synth) {
    onEnd?.();
    return;
  }

  // Cancel anything currently playing
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = companion.speechRate ?? 0.9;
  utterance.pitch = companion.speechPitch ?? 1.0;
  utterance.volume = 1;

  // Guaranteed timeout: if onend never fires, resolve anyway after
  // estimated duration (100ms per word) + 3s buffer
  const wordCount = text.split(/\s+/).length;
  const timeoutMs = Math.max(5000, wordCount * 350 + 3000);
  let ended = false;
  const guardTimer = setTimeout(() => {
    if (!ended) {
      ended = true;
      onEnd?.();
    }
  }, timeoutMs);

  utterance.onend = () => {
    if (!ended) {
      ended = true;
      clearTimeout(guardTimer);
      onEnd?.();
    }
  };
  utterance.onerror = () => {
    if (!ended) {
      ended = true;
      clearTimeout(guardTimer);
      onEnd?.();
    }
  };

  const trySpeak = () => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
      // Pick a voice matching gender preference
      const preferred = voices.find((v) =>
        companion.voiceGender === "female"
          ? v.name.includes("Samantha") ||
            v.name.includes("Karen") ||
            v.name.includes("Victoria") ||
            v.name.includes("Google UK English Female") ||
            v.name.toLowerCase().includes("female")
          : v.name.includes("Daniel") ||
            v.name.includes("Alex") ||
            v.name.includes("Tom") ||
            v.name.includes("Google UK English Male") ||
            v.name.toLowerCase().includes("male"),
      );
      if (preferred) utterance.voice = preferred;
    }
    try {
      synth.speak(utterance);
    } catch {
      if (!ended) {
        ended = true;
        clearTimeout(guardTimer);
        onEnd?.();
      }
    }
  };

  const voices = synth.getVoices();
  if (voices.length > 0) {
    trySpeak();
  } else {
    synth.addEventListener("voiceschanged", trySpeak, { once: true });
    // Fallback: try anyway after 500ms even if voiceschanged never fires
    setTimeout(() => {
      if (!synth.speaking && !ended) {
        trySpeak();
      }
    }, 500);
  }
}

export function useSpeech() {
  const speakingRef = useRef(false);

  const speak = useCallback(
    async (text: string, companion: Companion, onEnd?: () => void) => {
      speakingRef.current = true;
      browserSpeak(text, companion, () => {
        speakingRef.current = false;
        onEnd?.();
      });
    },
    [],
  );

  const stop = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      // ignore
    }
    speakingRef.current = false;
  }, []);

  const isSpeakingNow = useCallback(() => {
    return speakingRef.current;
  }, []);

  return { speak, stop, isSpeaking: isSpeakingNow };
}

export function useVoiceRecognition() {
  const recognitionRef = useRef<{ stop(): void } | null>(null);
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

        recognition.onend = () => {
          if (!resultDispatchedRef.current) {
            onError?.();
          }
        };

        recognition.onerror = (event) => {
          if (event.error !== "aborted" && !resultDispatchedRef.current) {
            resultDispatchedRef.current = true;
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
