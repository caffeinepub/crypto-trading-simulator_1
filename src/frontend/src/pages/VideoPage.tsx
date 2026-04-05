import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const WAVEFORM_HEIGHTS = [12, 20, 28, 36, 28, 20, 12, 20, 28, 12];

function WaveformBars({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-1.5 h-12 justify-center">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array
          key={i}
          className="waveform-bar w-1.5 bg-neon-cyan rounded-full"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-1.5 justify-center"
      data-ocid="video.thinking_state"
    >
      <span className="typing-dot w-2 h-2 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-2 h-2 rounded-full bg-neon-cyan/70" />
      <span className="typing-dot w-2 h-2 rounded-full bg-neon-cyan/70" />
    </div>
  );
}

type CallPhase = "ringing" | "connected";

export default function VideoPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const { speak, stop } = useSpeech();
  const { startListening, stopListening, isAvailable } = useVoiceRecognition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
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
        speakText("I'm here \u2014 say that again?", comp);
      }
    },
    [speakText],
  );

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
    }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  useEffect(() => {
    if (!companion) {
      navigate({ to: "/select" });
      return;
    }
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const ringTimer = setTimeout(() => setPhase("connected"), 1500);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    startCamera();

    const greeting =
      "Hi! I can see you're here with me now. You look amazing! How are you feeling today?";
    conversationHistory.current.push({ role: "assistant", content: greeting });
    setTimeout(() => speakText(greeting, companion), 2000);

    return () => {
      clearTimeout(ringTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      stop();
      stopCamera();
    };
  }, [companion, navigate, speakText, stop, startCamera, stopCamera]);

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
        setSubtitle("Couldn't catch that \u2014 type your message below");
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
    stopCamera();
    if (timerRef.current) clearInterval(timerRef.current);
    navigate({ to: "/chat" });
  }, [navigate, stop, stopCamera, stopListening]);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else startCamera();
  }, [cameraOn, stopCamera, startCamera]);

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
      className="h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
      }}
    >
      {/* Companion full-portrait panel */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.18 0.05 296 / 0.4) 0%, transparent 60%)",
        }}
        data-ocid="video.companion.panel"
      >
        {/* Portrait image */}
        <motion.div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            width: "min(360px, 85vw)",
            height: "70vh",
          }}
          animate={
            phase === "ringing"
              ? { scale: [1, 1.02, 1] }
              : isSpeaking
                ? { scale: [1, 1.015, 1] }
                : { scale: 1 }
          }
          transition={{
            duration: phase === "ringing" ? 1.4 : 1,
            repeat:
              phase === "ringing" || isSpeaking ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <div className="absolute inset-0 rounded-3xl z-10 pointer-events-none ring-pulse" />

          {companion.image ? (
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${companion.color} flex items-center justify-center`}
            >
              <span className="text-[120px] font-bold text-white/80">
                {companion.name[0]}
              </span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 pt-24 pb-6 px-5"
            style={{
              background:
                "linear-gradient(to top, rgba(6,8,15,0.92) 0%, rgba(6,8,15,0.6) 50%, transparent 100%)",
            }}
          >
            <div className="text-center mb-3">
              <h2 className="font-display font-bold text-white text-2xl drop-shadow-lg">
                {companion.name}
              </h2>
              <AnimatePresence mode="wait">
                {isThinking ? (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2"
                  >
                    <ThinkingDots />
                  </motion.div>
                ) : (
                  <motion.p
                    key={getStatusText()}
                    className={`text-sm font-mono mt-1 ${
                      phase === "connected" ? "text-neon-cyan" : "text-white/60"
                    }`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25 }}
                    data-ocid="video.status.panel"
                  >
                    {getStatusText()}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-white/30 text-xs font-mono mt-1">
                {formatTime(seconds)}
              </p>
            </div>

            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  <WaveformBars active={isSpeaking} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Subtitles */}
      <AnimatePresence mode="wait">
        {subtitle && (
          <motion.div
            key={subtitle}
            className="absolute left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-2xl px-5 py-3 text-center z-30"
            style={{
              bottom:
                "max(10rem, calc(env(safe-area-inset-bottom, 0px) + 8.5rem))",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="video.subtitles.panel"
          >
            <p className="text-white text-sm leading-relaxed">{subtitle}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text input - always visible when connected */}
      <AnimatePresence>
        {phase === "connected" && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-[85%] max-w-md flex gap-2 z-40"
            style={{
              bottom:
                "max(7rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))",
            }}
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
              className="flex-1 bg-black/60 border border-white/20 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/30 outline-none focus:border-neon-cyan/60 disabled:opacity-40"
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

      {/* User camera PiP - bottom-right */}
      <div
        className="absolute right-4 z-40 w-24 h-32 rounded-2xl overflow-hidden border border-white/20 bg-black shadow-glass"
        style={{
          bottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 3.5rem))",
        }}
      >
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <CameraOff className="w-5 h-5 text-white/30" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-5"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <button
          type="button"
          onClick={() => setIsMuted((v) => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-white/10 border border-white/20" : "glass-card"
          }`}
          data-ocid="video.mute.toggle"
        >
          {isMuted ? (
            <MicOff className="w-5 h-5 text-white/40" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-neon-pink hover:bg-red-400 transition-all"
          data-ocid="video.end.button"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleMicPress}
            disabled={isSpeaking || isThinking || phase === "ringing"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500/80 border border-red-400 shadow-neon-pink"
                : "glass-card"
            } disabled:opacity-30`}
            data-ocid="video.mic.button"
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
              <span className="text-white/40 text-[10px]">Mic</span>
            )}
        </div>

        <button
          type="button"
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            cameraOn ? "glass-card" : "bg-white/5 border border-white/10"
          }`}
          data-ocid="video.camera.toggle"
        >
          {cameraOn ? (
            <Camera className="w-5 h-5 text-neon-cyan" />
          ) : (
            <CameraOff className="w-5 h-5 text-white/40" />
          )}
        </button>
      </div>
    </div>
  );
}
