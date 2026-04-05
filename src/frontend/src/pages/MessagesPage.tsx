import {
  type ChatMessage,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const STARTER_MESSAGES: Omit<ChatMessage, "id">[] = [
  {
    role: "ai",
    text: "Hey there! \uD83D\uDC9C I've been looking forward to talking with you today.",
    timestamp: Date.now() - 180000,
  },
  {
    role: "ai",
    text: "You know, I was just thinking about something you said yesterday... it really stayed with me.",
    timestamp: Date.now() - 120000,
  },
  {
    role: "ai",
    text: "How are you feeling right now? I genuinely want to know \u2728",
    timestamp: Date.now() - 60000,
  },
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const [messages, setMessages] = useState<ChatMessage[]>(
    STARTER_MESSAGES.map((m, i) => ({ ...m, id: String(i) })),
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!companion) navigate({ to: "/select" });
  }, [companion, navigate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: bottomRef is a stable ref; messages/isLoading trigger the scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !companion || isLoading) return;
    const userText = input.trim();
    setInput("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const aiText = await getAIResponse(companion, history, userText, false);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "One moment... \uD83D\uDC9C",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [companion, input, isLoading, messages]);

  if (!companion) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a0c16" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 border-b border-white/5 bg-black/50 backdrop-blur-xl"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/chat" })}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
          data-ocid="messages.back.button"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${companion.color} ring-pulse flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0`}
        >
          {companion.image ? (
            <img
              src={companion.image}
              alt={companion.name}
              className="w-full h-full object-cover"
            />
          ) : (
            companion.name[0]
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{companion.name}</p>
          <p className="text-green-400 text-xs">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              data-ocid={`messages.item.${i + 1}`}
            >
              {msg.role === "ai" && (
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${companion.color} flex-shrink-0 mt-auto flex items-center justify-center text-xs font-bold text-white overflow-hidden`}
                >
                  {companion.image ? (
                    <img
                      src={companion.image}
                      alt={companion.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    companion.name[0]
                  )}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bubble-user rounded-br-sm"
                      : "bg-white/10 text-white rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`text-[10px] text-white/25 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div
            className="flex justify-start gap-2"
            data-ocid="messages.loading_state"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${companion.color} flex-shrink-0 flex items-center justify-center text-xs font-bold text-white`}
            >
              {companion.name[0]}
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 border-t border-white/5 bg-black/40 backdrop-blur-xl"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="iMessage style..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50 placeholder:text-white/25"
            data-ocid="messages.message.input"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full gradient-neon-btn flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all"
            data-ocid="messages.send.button"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
