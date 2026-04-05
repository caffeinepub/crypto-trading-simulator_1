import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const WAVEFORM_HEIGHTS_IDLE = [4, 4, 4, 4, 4, 4, 4];
const WAVEFORM_HEIGHTS_ACTIVE = [8, 14, 20, 28, 20, 14, 8];

function WaveformBars({ active }: { active: boolean }) {
  const heights = active ? WAVEFORM_HEIGHTS_ACTIVE : WAVEFORM_HEIGHTS_IDLE;
  return (
    <div className="flex items-end gap-1 h-8">
      {heights.map((h, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array
          key={i}
          className={
            active
              ? "waveform-bar w-1 bg-neon-cyan rounded-full"
              : "w-1 rounded-full bg-neon-cyan/30"
          }
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-1 mt-1"
      data-ocid="call.thinking_state"
    >
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-neon-cyan/70" />
    </div>
  );
}

type CallPhase = "ringing" | "connected";

export default function CallPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const { speak, stop } = useSpeech();
  const { startListening, stopListening, isAvailable } = useVoiceRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState<CallPhase>("ringing");
  const [textInput, setTextInput] = useState("");

  const hasGreeted = useRef(false);
  const conversationHistory = useRef<Array<{ role: string; content: string }>>(
    [],
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setSubtitle(`You: ${message}`);
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
        speakText(aiText, comp);
      } catch {
        setIsThinking(false);
        speakText("I missed that \u2014 could you say it again?", comp);
      }
    },
    [speakText],
  );

  useEffect(() => {
    if (!companion) {
      navigate({ to: "/select" });
      return;
    }
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const ringTimer = setTimeout(() => setPhase("connected"), 1500);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    const greeting =
      "Hey! It's so good to hear from you. How are you doing today?";
    conversationHistory.current.push({ role: "assistant", content: greeting });
    setTimeout(() => speakText(greeting, companion), 2000);

    return () => {
      clearTimeout(ringTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      stop();
    };
  }, [companion, navigate, speakText, stop]);

  const handleMicPress = useCallback(() => {
    if (!companion || isSpeaking || isThinking) return;
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }
    if (!isAvailable) {
      setSubtitle("Type your message below");
      return;
    }
    setIsListening(true);
    setSubtitle("Listening...");
    startListening(
      async (transcript) => {
        setIsListening(false);
        sendMessage(transcript, companion);
      },
      () => {
        setIsListening(false);
        setSubtitle("Couldn't hear you \u2014 type your message below");
      },
    );
  }, [
    companion,
    isAvailable,
    isListening,
    isSpeaking,
    isThinking,
    sendMessage,
    startListening,
    stopListening,
  ]);

  const handleTextSend = useCallback(() => {
    if (!companion || !textInput.trim() || isSpeaking || isThinking) return;
    const msg = textInput.trim();
    setTextInput("");
    sendMessage(msg, companion);
  }, [companion, isSpeaking, isThinking, sendMessage, textInput]);

  const handleEndCall = useCallback(() => {
    stop();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    navigate({ to: "/chat" });
  }, [navigate, stop, stopListening]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (phase === "ringing") return "Ringing...";
    if (isSpeaking) return "Speaking...";
    if (isListening) return "Listening...";
    if (isThinking) return "Thinking...";
    return "Connected";
  };

  if (!companion) return null;

  return (
    <div
      className="h-screen flex flex-col items-center justify-between pb-6 pt-16 px-6"
      style={{
        background: "linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
      }}
    >
      {/* Top info */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-neon text-sm uppercase tracking-widest">
          AI Voice Call
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={getStatusText()}
            className={`text-sm font-mono ${
              phase === "connected" ? "text-neon-cyan" : "text-white/50"
            }`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            data-ocid="call.status.panel"
          >
            {getStatusText()}
          </motion.p>
        </AnimatePresence>
        <p className="text-white/30 text-xs font-mono">{formatTime(seconds)}</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className={`w-36 h-36 rounded-full bg-gradient-to-br ${
            companion.color
          } overflow-hidden ring-pulse`}
          animate={
            phase === "ringing"
              ? { scale: [1, 1.06, 1] }
              : isSpeaking
                ? { scale: [1, 1.04, 1] }
                : { scale: 1 }
          }
          transition={{
            duration: phase === "ringing" ? 1.2 : 0.8,
            repeat:
              phase === "ringing" || isSpeaking ? Number.POSITIVE_INFINITY : 0,
          }}
          data-ocid="call.avatar.panel"
        >
          {companion.image ? (
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
              {companion.name[0]}
            </div>
          )}
        </motion.div>

        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-white">
            {companion.name}
          </h2>
          {isThinking ? (
            <ThinkingDots />
          ) : (
            <p className="text-body text-sm mt-1">{companion.personality}</p>
          )}
        </div>

        <WaveformBars active={isSpeaking} />
      </div>

      {/* Subtitles */}
      <AnimatePresence mode="wait">
        {subtitle && (
          <motion.div
            key={subtitle}
            className="glass-card rounded-2xl px-5 py-3 max-w-sm text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="call.subtitles.panel"
          >
            <p className="text-white text-sm leading-relaxed">{subtitle}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text input - always visible when connected */}
      <AnimatePresence>
        {phase === "connected" && (
          <motion.div
            className="w-full max-w-sm flex gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
              placeholder={`Type to ${companion.name}...`}
              disabled={isSpeaking || isThinking}
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-neon-cyan/60 disabled:opacity-40"
            />
            <button
              type="button"
              onClick={handleTextSend}
              disabled={!textInput.trim() || isSpeaking || isThinking}
              className="w-10 h-10 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-neon-cyan" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => setIsMuted((v) => !v)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted ? "bg-white/10 border border-white/20" : "glass-card"
            }`}
            data-ocid="call.mute.toggle"
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-white/50" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-neon-pink hover:bg-red-400 transition-all"
            data-ocid="call.end.button"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleMicPress}
              disabled={isSpeaking || isThinking || phase === "ringing"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500/80 border border-red-400 shadow-neon-pink"
                  : "glass-card"
              } disabled:opacity-30`}
              data-ocid="call.mic.button"
            >
              <Mic
                className={`w-5 h-5 ${
                  isListening ? "text-white" : "text-neon-cyan"
                }`}
              />
            </button>
            {!isListening &&
              !isSpeaking &&
              !isThinking &&
              phase === "connected" && (
                <span className="text-white/40 text-xs">Mic</span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
