import { useSpeech, useVoiceRecognition } from "@/hooks/useSpeech";
import {
  type Companion,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const WAVEFORM_HEIGHTS = [12, 20, 28, 36, 28, 20, 12];

function WaveformBars({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-1 h-10 justify-center">
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
    if (callStarted) return;
    setCallStarted(true);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    startCamera();
    const greeting =
      "Hi! I can see you're here with me now. You look great! How are you feeling?";
    conversationHistory.current.push({ role: "assistant", content: greeting });
    setTimeout(() => speakText(greeting, companion), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stop();
      stopCamera();
    };
  }, [
    companion,
    navigate,
    speakText,
    stop,
    startCamera,
    stopCamera,
    callStarted,
  ]);

  const handleMicPress = useCallback(() => {
    if (!companion || isSpeaking) return;
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }
    if (!isAvailable) {
      setSubtitle("Voice input not supported in this browser");
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
          speakText("I'm here \u2014 say that again?", companion);
        }
      },
      () => {
        setIsListening(false);
        setSubtitle("Couldn't catch that \u2014 tap mic to retry");
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

  if (!companion) return null;

  return (
    <div
      className="h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #06080f 0%, #0d0619 100%)",
      }}
    >
      {/* Companion panel */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isSpeaking ? "ring-pulse-speaking" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.18 0.05 296 / 0.4) 0%, transparent 60%)",
        }}
        data-ocid="video.companion.panel"
      >
        <div
          className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br ${
            companion.color
          } overflow-hidden ${isSpeaking ? "ring-pulse-speaking" : "ring-pulse"}`}
        >
          {companion.image ? (
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-white">
              {companion.name[0]}
            </div>
          )}
          <AnimatePresence>
            {isSpeaking && (
              <motion.div
                className="absolute inset-0 flex items-end justify-center pb-6 bg-black/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WaveformBars active={isSpeaking} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-center">
          <p className="font-display font-bold text-white text-xl drop-shadow-lg">
            {companion.name}
          </p>
          <p className="text-white/50 text-xs">{formatTime(seconds)}</p>
        </div>
      </div>

      {/* Subtitles */}
      <AnimatePresence mode="wait">
        {subtitle && (
          <motion.div
            key={subtitle}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-2xl px-5 py-3 text-center z-30"
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

      {/* User camera PiP */}
      <div className="absolute bottom-28 right-4 z-20 w-24 h-32 rounded-2xl overflow-hidden border border-white/20 bg-black shadow-glass">
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setIsMuted((v) => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-white/10" : "glass-card"
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

        <button
          type="button"
          onClick={handleMicPress}
          disabled={isSpeaking}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isListening ? "bg-red-500/80 border border-red-400" : "glass-card"
          } disabled:opacity-30`}
          data-ocid="video.mic.button"
        >
          <Mic
            className={`w-5 h-5 ${isListening ? "text-white" : "text-neon-cyan"}`}
          />
        </button>

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
