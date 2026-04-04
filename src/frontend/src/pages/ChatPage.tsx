import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type ChatMessage,
  type Companion,
  generateResponse,
  getWelcomeMessage,
} from "@/lib/aiResponses";
import { ArrowLeft, Heart, MoreVertical, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatPageProps {
  companion: Companion;
  onBack: () => void;
}

const STORAGE_KEY = (name: string) => `heartfelt_chat_${name.toLowerCase()}`;

export default function ChatPage({ companion, onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load persisted chat or set welcome message
  useEffect(() => {
    const key = STORAGE_KEY(companion.name);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        setMessages(parsed);
        return;
      } catch {
        // fall through to welcome
      }
    }
    const welcome: ChatMessage = {
      id: "welcome",
      role: "companion",
      text: getWelcomeMessage(companion),
      timestamp: Date.now(),
    };
    setMessages([welcome]);
  }, [companion]);

  // Persist chat to localStorage
  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem(STORAGE_KEY(companion.name), JSON.stringify(messages));
  }, [messages, companion.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay (800ms - 1800ms)
    const delay = 800 + Math.random() * 1000;
    await new Promise((r) => setTimeout(r, delay));

    const responseText = generateResponse(text, companion.personality);
    const aiMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: "companion",
      text: responseText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, [input, isTyping, companion.personality]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY(companion.name));
    const welcome: ChatMessage = {
      id: "welcome",
      role: "companion",
      text: getWelcomeMessage(companion),
      timestamp: Date.now(),
    };
    setMessages([welcome]);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cardBg = {
    pink: "bg-hf-card-pink",
    blue: "bg-hf-card-blue",
    peach: "bg-hf-card-peach",
  }[companion.color];

  return (
    <div
      className="min-h-screen flex flex-col bg-hf-cream font-sans"
      data-ocid="chat.panel"
    >
      {/* Header */}
      <header className="bg-hf-peach-header shadow-xs sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-hf-blush transition-colors"
            aria-label="Go back"
            data-ocid="chat.back.button"
          >
            <ArrowLeft className="w-5 h-5 text-hf-brown" />
          </button>

          <div
            className={`w-10 h-10 rounded-full ${cardBg} flex items-center justify-center text-xl flex-shrink-0`}
          >
            {companion.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-hf-brown text-base truncate">
                {companion.name}
              </h1>
              <Heart className="w-3.5 h-3.5 text-hf-rose fill-current flex-shrink-0" />
            </div>
            <p className="text-xs text-hf-body capitalize">
              Your AI {companion.type} &middot; {companion.personality}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-hf-blush transition-colors"
                aria-label="More options"
                data-ocid="chat.options.dropdown_menu"
              >
                <MoreVertical className="w-5 h-5 text-hf-body" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={clearChat}
                className="text-destructive focus:text-destructive cursor-pointer"
                data-ocid="chat.clear.delete_button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1" data-ocid="chat.messages.list">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
              data-ocid={`chat.item.${index + 1}`}
            >
              {msg.role === "companion" && (
                <div
                  className={`w-8 h-8 rounded-full ${cardBg} flex items-center justify-center text-base mr-2 flex-shrink-0 self-end mb-1`}
                >
                  {companion.emoji}
                </div>
              )}
              <div className="max-w-[75%] flex flex-col">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bubble-user rounded-tr-sm"
                      : "bubble-ai rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span
                  className={`text-[10px] text-hf-body/60 mt-1 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div
              className="flex justify-start items-end gap-2 animate-fade-in"
              data-ocid="chat.typing.loading_state"
            >
              <div
                className={`w-8 h-8 rounded-full ${cardBg} flex items-center justify-center text-base flex-shrink-0`}
              >
                {companion.emoji}
              </div>
              <div className="bubble-ai rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                <div className="flex gap-1.5 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-hf-rose/60 typing-dot"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div
        className="bg-white border-t border-border sticky bottom-0"
        data-ocid="chat.input.panel"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${companion.name}...`}
            className="flex-1 rounded-full border-border bg-muted/50 focus:border-hf-rose text-hf-brown placeholder:text-hf-body/50 px-5"
            disabled={isTyping}
            maxLength={500}
            data-ocid="chat.message.input"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="rounded-full bg-hf-rose hover:bg-accent text-white w-11 h-11 flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40"
            aria-label="Send message"
            data-ocid="chat.send.primary_button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-hf-body/40 pb-2">
          AI responses are simulated for entertainment purposes.
        </p>
      </div>
    </div>
  );
}
