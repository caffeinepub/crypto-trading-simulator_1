import type { Companion } from "@/lib/companions";
import { useCallback, useRef } from "react";

// ---------- SpeechRecognition type shim ----------
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

// ---------- Helpers ----------

/**
 * Speak text via browser SpeechSynthesis.
 * Guarantees onEnd() is ALWAYS called (timeout fallback) so isSpeaking
 * can never get stuck permanently.
 *   - wordCount * 350 ms + 3 s buffer, clamped to [5 s, 12 s]
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
  try {
    synth.cancel();
  } catch {
    /* ignore */
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = companion.speechRate ?? 0.9;
  utterance.pitch = companion.speechPitch ?? 1.0;
  utterance.volume = 1;

  // Guaranteed timeout: resolves even if onend never fires
  const wordCount = text.split(/\s+/).length;
  const timeoutMs = Math.min(12000, Math.max(5000, wordCount * 350 + 3000));
  let ended = false;

  const finish = () => {
    if (!ended) {
      ended = true;
      clearTimeout(guardTimer);
      onEnd?.();
    }
  };

  const guardTimer = setTimeout(finish, timeoutMs);
  utterance.onend = finish;
  utterance.onerror = finish;

  const doSpeak = () => {
    const voices = synth.getVoices();
    if (voices.length > 0) {
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
      finish();
    }
  };

  const voices = synth.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    // voiceschanged fires asynchronously; fallback after 600 ms just in case
    synth.addEventListener("voiceschanged", doSpeak, { once: true });
    setTimeout(() => {
      if (!synth.speaking && !ended) doSpeak();
    }, 600);
  }
}

// ---------- Hooks ----------

export function useSpeech() {
  const speakingRef = useRef(false);

  const speak = useCallback(
    (text: string, companion: Companion, onEnd?: () => void) => {
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
      /* ignore */
    }
    speakingRef.current = false;
  }, []);

  /** Returns true while the companion is speaking */
  const isSpeakingNow = useCallback(() => speakingRef.current, []);

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

        // CRITICAL: onend fires when the browser finishes listening.
        // Without this, the app hangs in "Listening..." and never sends the message.
        recognition.onend = () => {
          if (!resultDispatchedRef.current) {
            // No result captured — fall back to text input
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
      /* ignore */
    }
  }, []);

  return { startListening, stopListening, isAvailable };
}
