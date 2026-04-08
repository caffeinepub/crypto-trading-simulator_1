import { useSaveChatHistory } from "@/hooks/useQueries";
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

// ── Persistence helpers ────────────────────────────────────────────────────────

function historyKey(id: string) {
  return `heartfelt_chat_${id}`;
}
function ctxKey(id: string) {
  return `heartfelt_ctx_${id}`;
}

function loadMessages(id: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(historyKey(id));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}
function persistMessages(id: string, msgs: ChatMessage[]) {
  localStorage.setItem(historyKey(id), JSON.stringify(msgs));
}

function loadCtx(id: string): Array<{ role: string; content: string }> {
  try {
    const raw = localStorage.getItem(ctxKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persistCtx(id: string, ctx: Array<{ role: string; content: string }>) {
  localStorage.setItem(ctxKey(id), JSON.stringify(ctx.slice(-24)));
}

// ── Starter greeting per companion ────────────────────────────────────────────

const STARTERS: Record<string, string> = {
  sofia:
    "Hey, you! 💕 I was just thinking about you. How's your day going so far?",
  ethan:
    "Hey! You finally showed up — I've been waiting. What's on your mind today?",
  luna: "Oh, you're here... I had a feeling you'd appear. Tell me something interesting 🌙",
};

function starterFor(id: string): string {
  return (
    STARTERS[id] ??
    "Hey! So glad you're here. What would you like to talk about? 💫"
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingBubble({ src, name }: { src: string; name: string }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      data-ocid="chat.loading_state"
    >
      <img
        src={src}
        alt={name}
        className="w-7 h-7 rounded-full object-cover ring-1 ring-primary/40 flex-shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "/assets/images/placeholder.svg";
        }}
      />
      <div className="bubble-ai rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const saveChatHistory = useSaveChatHistory();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!companion) return [];
    const saved = loadMessages(companion.id);
    if (saved.length > 0) return saved;
    return [
      {
        id: "starter",
        role: "ai",
        text: starterFor(companion.id),
        timestamp: Date.now(),
      },
    ];
  });

  const [ctx, setCtx] = useState<Array<{ role: string; content: string }>>(
    () => (companion ? loadCtx(companion.id) : []),
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hotTalks, setHotTalks] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!companion) navigate({ to: "/select" });
  }, [companion, navigate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
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

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    persistMessages(companion.id, nextMsgs);

    const nextCtx = [...ctx, { role: "user", content: userText }];
    setIsLoading(true);

    try {
      const aiText = await getAIResponse(companion, ctx, userText, hotTalks);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiText,
        timestamp: Date.now(),
      };
      const finalMsgs = [...nextMsgs, aiMsg];
      setMessages(finalMsgs);
      persistMessages(companion.id, finalMsgs);

      const finalCtx = [...nextCtx, { role: "assistant", content: aiText }];
      setCtx(finalCtx);
      persistCtx(companion.id, finalCtx);

      saveChatHistory.mutate(
        finalCtx.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I'm having a little moment... try again in a sec 💫",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [companion, ctx, hotTalks, input, isLoading, messages, saveChatHistory]);

  if (!companion) return null;

  const formatTime = (ts: number) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(ts));

  return (
    <div className="h-screen flex flex-col bg-dark-base">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
          aria-label="Go back"
          data-ocid="chat.back.button"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <div className="w-10 h-10 rounded-full ring-pulse overflow-hidden flex-shrink-0">
          <img
            src={companion.image}
            alt={companion.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">
            {companion.name}
          </p>
          <p className="text-neon-cyan text-xs">Online · AI Companion</p>
        </div>

        <div className="flex items-center gap-1">
          {/* Hot Talks */}
          <button
            type="button"
            onClick={() => setHotTalks((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              hotTalks
                ? "bg-orange-500/20 border border-orange-500/50 glow-pink"
                : "glass-card"
            }`}
            title="Hot Talks Mode"
            aria-label={hotTalks ? "Disable Hot Talks" : "Enable Hot Talks"}
            data-ocid="chat.hot_talks.toggle"
          >
            <Flame
              className={`w-4 h-4 ${hotTalks ? "text-orange-400 heartbeat" : "text-muted-neon"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/messages" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Messages"
            data-ocid="chat.messages.button"
          >
            <MessageCircle className="w-4 h-4 text-muted-neon" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/call" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Voice call"
            data-ocid="chat.call.button"
          >
            <Phone className="w-4 h-4 text-muted-neon" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/video" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Video call"
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 flex-shrink-0"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 heartbeat" />
            <span className="text-xs text-orange-300 font-medium">
              Hot Talks Mode Active — {companion.name} is feeling extra playful
              🔥
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
        data-ocid="chat.messages"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const prevRole = messages[i - 1]?.role;
            const showAvatar = !isUser && prevRole !== "ai";
            return (
              <motion.div
                key={msg.id}
                className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                data-ocid={`chat.message.item.${i + 1}`}
              >
                {!isUser && (
                  <div className="w-7 flex-shrink-0">
                    {showAvatar && (
                      <img
                        src={companion.image}
                        alt={companion.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-primary/40"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/assets/images/placeholder.svg";
                        }}
                      />
                    )}
                  </div>
                )}
                <div
                  className={`flex flex-col gap-0.5 max-w-[72%] ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bubble-user rounded-br-sm"
                        : "bubble-ai rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-white/25 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && (
            <TypingBubble src={companion.image} name={companion.name} />
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 border-t border-white/5 bg-black/30 backdrop-blur-xl flex-shrink-0"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              hotTalks
                ? `Say something flirty to ${companion.name}...`
                : `Message ${companion.name}...`
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50 placeholder:text-white/25 disabled:opacity-60"
            data-ocid="chat.message.input"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
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
