import { useSaveChatHistory } from "@/hooks/useQueries";
import {
  type ChatMessage,
  getAIResponse,
  getCompanionFromStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Phone, Send, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Persistence helpers ────────────────────────────────────────────────────────

function msgKey(id: string) {
  return `heartfelt_msg_${id}`;
}
function ctxKey(id: string) {
  return `heartfelt_msg_ctx_${id}`;
}

function loadMessages(id: string): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(msgKey(id));
    return raw ? (JSON.parse(raw) as ChatMessage[]) : null;
  } catch {
    return null;
  }
}
function persistMessages(id: string, msgs: ChatMessage[]) {
  localStorage.setItem(msgKey(id), JSON.stringify(msgs));
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

// ── Companion-specific starter messages ──────────────────────────────────────

const COMPANION_STARTERS: Record<
  string,
  Array<Omit<ChatMessage, "id" | "timestamp">>
> = {
  sofia: [
    {
      role: "ai",
      text: "Hey you 💕 I've been looking forward to talking today.",
    },
    {
      role: "ai",
      text: "I was thinking about you earlier and smiling to myself. Is that weird?",
    },
    {
      role: "ai",
      text: "How are you feeling right now? I genuinely want to know ✨",
    },
  ],
  ethan: [
    {
      role: "ai",
      text: "Hey! Finally. I was starting to wonder when you'd show up 😄",
    },
    {
      role: "ai",
      text: "You know what I like about you? You always seem to have something interesting going on.",
    },
    { role: "ai", text: "What's on your mind today?" },
  ],
  luna: [
    {
      role: "ai",
      text: "Oh... you appeared. Right when I was thinking something mysterious 🌙",
    },
    {
      role: "ai",
      text: "I've been collecting thoughts all day. Some of them are about you.",
    },
    { role: "ai", text: "Tell me something you haven't told anyone else ✨" },
  ],
};

const DEFAULT_STARTERS: Array<Omit<ChatMessage, "id" | "timestamp">> = [
  { role: "ai", text: "Hey there 💫 So glad you're here." },
  {
    role: "ai",
    text: "I've been thinking about what we'd talk about when you showed up.",
  },
  { role: "ai", text: "What would you like to talk about today?" },
];

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingBubble({ src, name }: { src: string; name: string }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      data-ocid="messages.loading_state"
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
      <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/60" />
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const navigate = useNavigate();
  const companion = getCompanionFromStorage();
  const saveChatHistory = useSaveChatHistory();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!companion) return [];
    const saved = loadMessages(companion.id);
    if (saved && saved.length > 0) return saved;

    // Build starter messages with staggered timestamps
    const starters = COMPANION_STARTERS[companion.id] ?? DEFAULT_STARTERS;
    const now = Date.now();
    return starters.map((m, i) => ({
      ...m,
      id: `starter-${i}`,
      timestamp: now - (starters.length - i) * 45000,
    }));
  });

  const [ctx, setCtx] = useState<Array<{ role: string; content: string }>>(
    () => (companion ? loadCtx(companion.id) : []),
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const aiText = await getAIResponse(companion, ctx, userText, false);
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
          text: "One moment... 💕",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [companion, ctx, input, isLoading, messages, saveChatHistory]);

  if (!companion) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  // Group messages by sender run for thread-style display
  type MsgGroup = {
    role: "user" | "ai";
    msgs: ChatMessage[];
  };

  const groups: MsgGroup[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.role === msg.role) {
      last.msgs.push(msg);
    } else {
      groups.push({ role: msg.role as "user" | "ai", msgs: [msg] });
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a0c16" }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 border-b border-white/5 bg-black/50 backdrop-blur-xl flex-shrink-0"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/chat" })}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
          aria-label="Back"
          data-ocid="messages.back.button"
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
          <p className="text-green-400 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Active now
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate({ to: "/call" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Voice call"
            data-ocid="messages.call.button"
          >
            <Phone className="w-4 h-4 text-muted-neon" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/video" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center"
            aria-label="Video call"
            data-ocid="messages.video.button"
          >
            <Video className="w-4 h-4 text-muted-neon" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        data-ocid="messages.list"
      >
        <AnimatePresence initial={false}>
          {groups.map((group, gi) => {
            const isUser = group.role === "user";
            return (
              <motion.div
                key={`group-${group.role}-${group.msgs[0]?.id ?? gi}`}
                className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                data-ocid={`messages.item.${gi + 1}`}
              >
                {/* Companion avatar — shown once per group */}
                {!isUser && (
                  <img
                    src={companion.image}
                    alt={companion.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-primary/40 flex-shrink-0 self-end"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/assets/images/placeholder.svg";
                    }}
                  />
                )}

                {/* Bubble stack for this group */}
                <div
                  className={`flex flex-col gap-1 max-w-[72%] ${isUser ? "items-end" : "items-start"}`}
                >
                  {group.msgs.map((msg, bi) => {
                    const isLast = bi === group.msgs.length - 1;
                    return (
                      <div key={msg.id} className="flex flex-col gap-0.5">
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed ${
                            isUser
                              ? `bubble-user ${isLast ? "rounded-2xl rounded-br-sm" : "rounded-2xl"}`
                              : `bg-white/10 text-white ${isLast ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"}`
                          }`}
                        >
                          {msg.text}
                        </div>
                        {isLast && (
                          <p
                            className={`text-[10px] text-white/25 px-1 ${isUser ? "text-right" : "text-left"}`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    );
                  })}
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

      {/* Input */}
      <div
        className="px-4 border-t border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0"
        style={{
          paddingTop: "0.75rem",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${companion.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50 placeholder:text-white/25 disabled:opacity-60"
            data-ocid="messages.message.input"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="w-10 h-10 rounded-full gradient-neon-btn flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
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
