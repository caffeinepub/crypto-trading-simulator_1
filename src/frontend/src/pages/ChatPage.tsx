import { useGetChatHistory, useSaveChatHistory } from "@/hooks/useQueries";
import {
  type ChatMessage,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Flame,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hotTalks, setHotTalks] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const saveChatHistory = useSaveChatHistory();
  const { data: savedHistory } = useGetChatHistory();

  useEffect(() => {
    if (!companion) navigate({ to: "/select" });
  }, [companion, navigate]);

  useEffect(() => {
    if (historyLoaded) return;
    if (savedHistory && savedHistory.length > 0) {
      const loaded: ChatMessage[] = savedHistory.map((m, i) => ({
        id: String(i),
        role: m.role === "user" ? "user" : "ai",
        text: m.content,
        timestamp: Date.now() - (savedHistory.length - i) * 60000,
      }));
      setMessages(loaded);
      setHistoryLoaded(true);
    } else if (savedHistory !== undefined && companion) {
      setMessages([
        {
          id: "welcome",
          role: "ai",
          text: `Hi! I'm ${companion.name} \uD83D\uDC9C I'm so happy you're here. What's on your mind?`,
          timestamp: Date.now(),
        },
      ]);
      setHistoryLoaded(true);
    }
  }, [savedHistory, companion, historyLoaded]);

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
      const aiText = await getAIResponse(
        companion,
        history,
        userText,
        hotTalks,
      );
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiText,
        timestamp: Date.now(),
      };
      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        saveChatHistory.mutate(
          updated.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        );
        return updated;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I'm having a moment... give me a second \uD83D\uDC9C",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [companion, hotTalks, input, isLoading, messages, saveChatHistory]);

  if (!companion) return null;

  return (
    <div className="h-screen flex flex-col bg-dark-base">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 border-b border-white/5 bg-black/40 backdrop-blur-xl"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/select" })}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
          data-ocid="chat.back.button"
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
          <p className="text-neon-cyan text-xs">Online \u2022 AI Companion</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setHotTalks((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              hotTalks
                ? "bg-orange-500/20 border border-orange-500/50"
                : "glass-card"
            }`}
            title="Hot Talks Mode"
            data-ocid="chat.hot_talks.toggle"
          >
            <Flame
              className={`w-4 h-4 ${hotTalks ? "text-orange-400" : "text-muted-neon"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/messages" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            data-ocid="chat.messages.button"
          >
            <MessageCircle className="w-4 h-4 text-muted-neon" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/call" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            data-ocid="chat.call.button"
          >
            <Phone className="w-4 h-4 text-muted-neon" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/video" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            data-ocid="chat.video.button"
          >
            <Video className="w-4 h-4 text-muted-neon" />
          </button>
        </div>
      </div>

      {/* Hot Talks banner */}
      <AnimatePresence>
        {hotTalks && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border-b border-orange-500/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-orange-300 font-medium">
              Hot Talks Mode Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              data-ocid={`chat.message.item.${i + 1}`}
            >
              {msg.role === "ai" && (
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${companion.color} flex-shrink-0 mr-2 mt-1 flex items-center justify-center text-xs font-bold text-white overflow-hidden`}
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
              <div
                className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bubble-user rounded-br-sm"
                    : "bubble-ai rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start" data-ocid="chat.loading_state">
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${companion.color} flex-shrink-0 mr-2 mt-1 flex items-center justify-center text-xs font-bold text-white`}
            >
              {companion.name[0]}
            </div>
            <div className="bubble-ai rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 border-t border-white/5 bg-black/30 backdrop-blur-xl"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder={`Message ${companion.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50 placeholder:text-white/25 resize-none"
            data-ocid="chat.message.input"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full gradient-neon-btn flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
            data-ocid="chat.send.button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
