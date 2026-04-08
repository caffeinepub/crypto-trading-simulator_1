import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  buildCallGreeting,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

function WaveformOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length array
          key={i}
          className="waveform-bar w-[5px] rounded-full bg-neon-cyan origin-bottom"
          style={{ height: `${10 + (i % 4) * 7}px` }}
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
    <span className="text-white/40 text-xs font-mono tabular-nums">
      {mm}:{ss}
    </span>
  );
}

export default function VideoPage() {
  const navigate = useNavigate();
  const { speak, stop } = useSpeech();
  const { startListening, stopListening, isAvailable } = useVoiceRecognition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
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

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setCameraOn(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
    }
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  // Greet immediately with buildCallGreeting — no delay, no API fetch
  useEffect(() => {
    const comp = getCompanionFromStorage();
    if (!comp) {
      void navigate({ to: "/select" });
      return;
    }
    setCompanion(comp);
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    void startCamera();

    const greeting = buildCallGreeting(comp);
    conversationHistory.current.push({ role: "assistant", content: greeting });
    speakText(greeting, comp);

    return () => {
      stop();
      stopCamera();
    };
  }, [navigate, speakText, stop, startCamera, stopCamera]);

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
    stopCamera();
    void navigate({ to: "/chat" });
  }, [navigate, stop, stopCamera, stopListening]);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else void startCamera();
  }, [cameraOn, stopCamera, startCamera]);

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
      className="h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
      }}
    >
      {/* === COMPANION FULL PORTRAIT (background layer) === */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        data-ocid="video.companion.panel"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.18 0.05 296 / 0.4) 0%, transparent 60%)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{ width: "min(380px, 90vw)", height: "72vh" }}
        >
          {/* Ring overlay */}
          <div
            className={`absolute inset-0 rounded-3xl z-10 pointer-events-none ${isSpeaking ? "ring-pulse-speaking" : "ring-pulse"}`}
          />

          {/* Companion image — full portrait */}
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
              <span className="text-[120px] font-bold text-white/80 select-none">
                {companion.name[0]}
              </span>
            </div>
          )}

          {/* Gradient overlay at bottom for text/controls legibility */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 pt-24 pb-4 px-4"
            style={{
              background:
                "linear-gradient(to top, rgba(6,8,15,0.92) 0%, rgba(6,8,15,0.6) 50%, transparent 100%)",
            }}
          >
            {/* Companion name + status */}
            <div className="text-center mb-2">
              <h2 className="font-display font-bold text-white text-xl drop-shadow-lg">
                {companion.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <AnimatePresence mode="wait">
                  {isThinking ? (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ThinkingDots />
                    </motion.div>
                  ) : (
                    <motion.p
                      key={getStatusText()}
                      className="text-xs font-mono text-neon-cyan"
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
                <CallTimer startTime={callStartTime} />
              </div>
              {errorMsg && (
                <p className="text-destructive text-xs mt-1">{errorMsg}</p>
              )}
            </div>

            {/* Waveform overlay while AI speaks */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  className="flex justify-center mb-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  <WaveformOverlay active={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* === SUBTITLES === */}
      <AnimatePresence>
        {(subtitle || userSubtitle) && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-[88%] max-w-sm glass-card rounded-2xl px-4 py-3 text-center z-30 space-y-1"
            style={{
              bottom:
                "max(9.5rem, calc(env(safe-area-inset-bottom, 0px) + 8rem))",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-ocid="video.subtitles.panel"
          >
            {userSubtitle && (
              <p className="text-neon-cyan text-xs">You: {userSubtitle}</p>
            )}
            {subtitle && !isListening && (
              <p className="text-foreground text-sm leading-relaxed">
                {subtitle}
              </p>
            )}
            {isListening && (
              <p className="text-neon-cyan text-sm animate-pulse">
                Listening&#x2026;
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TEXT INPUT — NEVER blocked by isSpeaking === */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[85%] max-w-sm flex gap-2 z-40"
        style={{
          bottom:
            "max(6.5rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))",
        }}
        data-ocid="video.text-input"
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder={`Type to ${companion.name}\u2026`}
          // Only disabled while fetching AI — NEVER blocked by isSpeaking
          disabled={isThinking}
          className="flex-1 bg-black/60 border border-white/20 rounded-full px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-neon-cyan/60 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={handleTextSend}
          disabled={!textInput.trim() || isThinking}
          className="w-11 h-11 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center disabled:opacity-30"
          data-ocid="video.send.button"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 text-neon-cyan" />
        </button>
      </div>

      {/* === PiP USER CAMERA — bottom-right === */}
      <div
        className="absolute right-4 z-40 w-24 h-32 rounded-2xl overflow-hidden border border-white/25 bg-black shadow-glass"
        style={{
          bottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4rem))",
        }}
        data-ocid="video.pip.panel"
      >
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <CameraOff className="w-5 h-5 text-white/30" />
          </div>
        )}
      </div>

      {/* === CONTROLS === */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-5"
        style={{
          bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Camera toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            cameraOn ? "glass-card" : "bg-white/5 border border-white/10"
          }`}
          data-ocid="video.camera.toggle"
          aria-label="Toggle camera"
        >
          {cameraOn ? (
            <Camera className="w-5 h-5 text-neon-cyan" />
          ) : (
            <CameraOff className="w-5 h-5 text-white/40" />
          )}
        </button>

        {/* End call */}
        <button
          type="button"
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center shadow-neon-pink hover:bg-destructive/80 transition-all"
          data-ocid="video.end.button"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6 text-destructive-foreground" />
        </button>

        {/* Mic / speak */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={handleMicPress}
            disabled={isThinking || !isAvailable}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-destructive/80 border border-destructive shadow-neon-pink scale-110"
                : "glass-card"
            } disabled:opacity-30`}
            data-ocid="video.mic.button"
            aria-label={isListening ? "Listening" : "Tap to speak"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-neon-cyan" />
            )}
          </button>
          {!isListening && !isThinking && isAvailable && (
            <span className="text-white/40 text-[9px]">Speak</span>
          )}
        </div>
      </div>
    </div>
  );
}
