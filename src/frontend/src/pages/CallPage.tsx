import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Mic, MicOff, PhoneOff } from "lucide-react";
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

export default function CallPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const { speak, stop } = useSpeech();
  const { startListening, stopListening, isAvailable } = useVoiceRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
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

  useEffect(() => {
    if (!companion) {
      navigate({ to: "/select" });
      return;
    }
    if (callStarted) return;
    setCallStarted(true);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    const greeting =
      "Hey! It's so good to hear from you. How are you doing today?";
    conversationHistory.current.push({ role: "assistant", content: greeting });
    setTimeout(() => speakText(greeting, companion), 800);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stop();
    };
  }, [callStarted, companion, navigate, speakText, stop]);

  const handleMicPress = useCallback(() => {
    if (!companion || isSpeaking) return;
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }
    if (!isAvailable) {
      setSubtitle("Voice not supported in this browser");
      return;
    }
    setIsListening(true);
    setSubtitle("Listening...");
    startListening(
      async (transcript) => {
        setIsListening(false);
        setSubtitle(`You: ${transcript}`);
        conversationHistory.current.push({ role: "user", content: transcript });
        try {
          const aiText = await getAIResponse(
            companion,
            conversationHistory.current.slice(0, -1),
            transcript,
            false,
          );
          conversationHistory.current.push({
            role: "assistant",
            content: aiText,
          });
          speakText(aiText, companion);
        } catch {
          speakText("I missed that \u2014 could you say it again?", companion);
        }
      },
      () => {
        setIsListening(false);
        setSubtitle("Couldn't hear you \u2014 tap mic to try again");
      },
    );
  }, [
    companion,
    isAvailable,
    isListening,
    isSpeaking,
    speakText,
    startListening,
    stopListening,
  ]);

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

  if (!companion) return null;

  return (
    <div
      className="h-screen flex flex-col items-center justify-between pb-12 pt-16 px-6"
      style={{
        background: "linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
      }}
    >
      {/* Top info */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-neon text-sm uppercase tracking-widest">
          AI Voice Call
        </p>
        <p className="text-white/50 text-sm font-mono">{formatTime(seconds)}</p>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className={`w-36 h-36 rounded-full bg-gradient-to-br ${
            companion.color
          } overflow-hidden ${isSpeaking ? "ring-pulse-speaking" : "ring-pulse"}`}
          animate={isSpeaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{
            duration: 0.8,
            repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0,
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
          <p className="text-body text-sm">{companion.personality}</p>
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

      {/* Controls */}
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

        <button
          type="button"
          onClick={handleMicPress}
          disabled={isSpeaking}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500/80 border border-red-400 shadow-neon-pink"
              : "glass-card"
          } disabled:opacity-30`}
          data-ocid="call.mic.button"
        >
          <Mic
            className={`w-5 h-5 ${isListening ? "text-white" : "text-neon-cyan"}`}
          />
        </button>
      </div>
    </div>
  );
}
