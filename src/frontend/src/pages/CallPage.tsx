import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  buildCallGreeting,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array
          key={i}
          className={
            active
              ? "waveform-bar w-1 rounded-full bg-neon-cyan origin-bottom"
              : "w-1 rounded-full bg-neon-cyan/25 origin-bottom"
          }
          style={{ height: active ? `${8 + (i % 4) * 6}px` : "4px" }}
        />
      ))}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1" data-ocid="call.thinking_state">
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
    </div>
  );
}

function CallTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const secs = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="text-muted-neon text-xs font-mono tabular-nums">
      {mm}:{ss}
    </span>
  );
}

export default function CallPage() {
  const navigate = useNavigate();
  const { speak, stop } = useSpeech();
  const { startListening, stopListening, isAvailable } = useVoiceRecognition();

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [userSubtitle, setUserSubtitle] = useState("");
  const [textInput, setTextInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [callStartTime] = useState(() => Date.now());

  const hasGreeted = useRef(false);
  const conversationHistory = useRef<Array<{ role: string; content: string }>>(
    [],
  );

  const speakText = useCallback(
    (text: string, comp: Companion) => {
      setSubtitle(text);
      setIsSpeaking(true);
      speak(text, comp, () => setIsSpeaking(false));
    },
    [speak],
  );

  const sendMessage = useCallback(
    async (message: string, comp: Companion) => {
      if (!message.trim()) return;
      stop();
      setIsSpeaking(false);
      setErrorMsg("");
      setUserSubtitle(message);
      setSubtitle("");
      setIsThinking(true);
      conversationHistory.current.push({ role: "user", content: message });
      try {
        const aiText = await getAIResponse(
          comp,
          conversationHistory.current.slice(0, -1),
          message,
          false,
        );
        conversationHistory.current.push({
          role: "assistant",
          content: aiText,
        });
        setIsThinking(false);
        setUserSubtitle("");
        speakText(aiText, comp);
      } catch (err) {
        setIsThinking(false);
        const msg = err instanceof Error ? err.message : "Network error";
        setErrorMsg(`AI error: ${msg}`);
        setSubtitle("");
        setUserSubtitle("");
      }
    },
    [speakText, stop],
  );

  // Greet immediately with buildCallGreeting — no API fetch, no delay
  useEffect(() => {
    const comp = getCompanionFromStorage();
    if (!comp) {
      void navigate({ to: "/select" });
      return;
    }
    setCompanion(comp);
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const greeting = buildCallGreeting(comp);
    conversationHistory.current.push({ role: "assistant", content: greeting });
    // Speak immediately — no timeout delay
    speakText(greeting, comp);

    return () => {
      stop();
    };
  }, [navigate, speakText, stop]);

  const handleMicPress = useCallback(() => {
    if (!companion || isThinking) return;
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }
    if (!isAvailable) return;
    stop();
    setIsSpeaking(false);
    setIsListening(true);
    setSubtitle("Listening\u2026");
    startListening(
      (transcript) => {
        setIsListening(false);
        void sendMessage(transcript, companion);
      },
      () => {
        setIsListening(false);
        setSubtitle("");
      },
    );
  }, [
    companion,
    isAvailable,
    isListening,
    isThinking,
    sendMessage,
    startListening,
    stop,
    stopListening,
  ]);

  const handleTextSend = useCallback(() => {
    if (!companion || !textInput.trim() || isThinking) return;
    const msg = textInput.trim();
    setTextInput("");
    void sendMessage(msg, companion);
  }, [companion, isThinking, sendMessage, textInput]);

  const handleEndCall = useCallback(() => {
    stop();
    stopListening();
    void navigate({ to: "/chat" });
  }, [navigate, stop, stopListening]);

  const getStatusText = () => {
    if (isSpeaking) return "Speaking\u2026";
    if (isListening) return "Listening\u2026";
    if (isThinking) return "Getting response\u2026";
    return "Connected";
  };

  if (!companion) {
    return (
      <div className="h-screen bg-dark-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col items-center justify-between px-5"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.18 0.06 296 / 0.3) 0%, transparent 60%), linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
        paddingTop: "max(3.5rem, env(safe-area-inset-top, 0px))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-muted-neon text-xs uppercase tracking-widest">
          AI Voice Call
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={getStatusText()}
            className="text-sm font-mono text-neon-cyan"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            data-ocid="call.status.panel"
          >
            {getStatusText()}
          </motion.p>
        </AnimatePresence>
        <CallTimer startTime={callStartTime} />
        {errorMsg && (
          <p className="text-destructive text-xs max-w-xs text-center mt-1">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Avatar + waveform */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className={`w-36 h-36 rounded-full overflow-hidden ${isSpeaking ? "ring-pulse-speaking" : "ring-pulse"}`}
            data-ocid="call.avatar.panel"
          >
            {companion.image ? (
              <img
                src={companion.image}
                alt={companion.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${companion.color} flex items-center justify-center`}
              >
                <span className="text-5xl font-bold text-white">
                  {companion.name[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {companion.name}
          </h2>
          {isThinking ? (
            <div className="flex justify-center mt-2">
              <ThinkingDots />
            </div>
          ) : (
            <p className="text-body text-sm mt-1">{companion.personality}</p>
          )}
        </div>

        <WaveformBars active={isSpeaking} />
      </div>

      {/* Subtitles */}
      <div
        className="w-full max-w-sm min-h-[72px] flex flex-col items-center justify-center gap-1.5"
        data-ocid="call.subtitles.panel"
      >
        <AnimatePresence mode="wait">
          {userSubtitle && (
            <motion.p
              key={`user-${userSubtitle}`}
              className="text-neon-cyan text-xs text-right self-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              You: {userSubtitle}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {subtitle && !isListening && (
            <motion.div
              key={subtitle}
              className="glass-card rounded-2xl px-5 py-3 w-full text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-foreground text-sm leading-relaxed">
                {subtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {isListening && (
          <p className="text-neon-cyan text-sm animate-pulse">
            Listening&#x2026;
          </p>
        )}
      </div>

      {/* Text input — NEVER disabled by isSpeaking */}
      <div className="w-full max-w-sm flex gap-2" data-ocid="call.text-input">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder={`Type to ${companion.name}\u2026`}
          // Only disabled while AI is fetching — NEVER blocked by isSpeaking
          disabled={isThinking}
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-foreground text-sm placeholder:text-muted-neon outline-none focus:border-neon-cyan/60 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={handleTextSend}
          disabled={!textInput.trim() || isThinking}
          className="w-11 h-11 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center disabled:opacity-30"
          data-ocid="call.send.button"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-neon-cyan" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        {/* Mute / unmute visual indicator only */}
        <button
          type="button"
          className="w-14 h-14 rounded-full glass-card flex items-center justify-center transition-all"
          aria-label="Mute"
          data-ocid="call.mute.toggle"
          onClick={() => {
            /* visual only — mic toggle handled below */
          }}
        >
          <Mic className="w-5 h-5 text-foreground" />
        </button>

        {/* End call */}
        <button
          type="button"
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-neon-pink hover:bg-destructive/80 transition-all"
          data-ocid="call.end.button"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6 text-destructive-foreground" />
        </button>

        {/* Speak button */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleMicPress}
            disabled={isThinking || !isAvailable}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-destructive/80 border border-destructive shadow-neon-pink scale-110"
                : "glass-card"
            } disabled:opacity-30`}
            data-ocid="call.mic.button"
            aria-label={isListening ? "Listening" : "Tap to speak"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-neon-cyan" />
            )}
          </button>
          {!isListening && !isThinking && isAvailable && (
            <span className="text-muted-neon text-[10px]">Tap to speak</span>
          )}
          {!isAvailable && (
            <span className="text-muted-neon text-[10px]">Type above</span>
          )}
        </div>
      </div>
    </div>
  );
}
