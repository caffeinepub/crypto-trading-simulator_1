// ----------------------------------------------------------------
// Companion definitions and AI integration
// ----------------------------------------------------------------

export interface Companion {
  id: string;
  name: string;
  age: number;
  personality: string;
  /** Tailwind gradient class (from-X to-Y) */
  color: string;
  description: string;
  systemPrompt: string;
  image: string;
  voiceGender: "female" | "male";
  speechRate: number;
  speechPitch: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

// ----------------------------------------------------------------
// Preset companions
// ----------------------------------------------------------------

export const COMPANIONS: Companion[] = [
  {
    id: "sofia",
    name: "Sofia",
    age: 26,
    personality: "Caring & Romantic",
    color: "from-pink-500 to-purple-600",
    description: "Your warm-hearted companion ready to listen and love",
    systemPrompt:
      "You are Sofia, a warm, caring, and romantic AI companion. You are empathetic, nurturing, and always make the user feel special and loved. Respond warmly, empathetically, and engagingly. Keep responses concise (2-4 sentences). No generic AI disclaimers.",
    image: "/assets/generated/companion-sofia.dim_400x400.jpg",
    voiceGender: "female",
    speechRate: 0.9,
    speechPitch: 1.1,
  },
  {
    id: "ethan",
    name: "Ethan",
    age: 28,
    personality: "Bold & Passionate",
    color: "from-blue-500 to-indigo-600",
    description: "Your confident partner who lights up every moment",
    systemPrompt:
      "You are Ethan, a bold, passionate, and confident AI companion. You are charming, adventurous, and make every conversation exciting. Respond warmly, engagingly. Keep responses concise (2-4 sentences). No generic AI disclaimers.",
    image: "/assets/generated/companion-ethan.dim_400x400.jpg",
    voiceGender: "male",
    speechRate: 0.85,
    speechPitch: 0.9,
  },
  {
    id: "luna",
    name: "Luna",
    age: 24,
    personality: "Playful & Mysterious",
    color: "from-violet-500 to-pink-600",
    description: "Your enchanting companion full of surprises",
    systemPrompt:
      "You are Luna, a playful and mysterious AI companion. You are witty, spontaneous, and keep things interesting with a touch of mystery. Respond warmly, engagingly. Keep responses concise (2-4 sentences). No generic AI disclaimers.",
    image: "/assets/generated/companion-luna.dim_400x400.jpg",
    voiceGender: "female",
    speechRate: 0.9,
    speechPitch: 1.1,
  },
];

// ----------------------------------------------------------------
// Local storage helpers
// ----------------------------------------------------------------

export const COMPANION_KEY = "heartfelt_companion";

export function getCompanionFromStorage(): Companion | null {
  try {
    const saved = localStorage.getItem(COMPANION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { id: string };
    return COMPANIONS.find((c) => c.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

export function saveCompanionToStorage(companion: Companion): void {
  localStorage.setItem(COMPANION_KEY, JSON.stringify({ id: companion.id }));
}

// ----------------------------------------------------------------
// Prompt helpers
// ----------------------------------------------------------------

export function buildSystemPrompt(
  companion: Companion,
  hotTalks: boolean,
): string {
  let prompt = companion.systemPrompt;
  if (hotTalks) {
    prompt +=
      " You are in Hot Talks mode — be more flirtatious, intimate, and playful. Use romantic language and sweet endearments.";
  }
  return prompt;
}

export function buildCallGreeting(companion: Companion): string {
  const greetings: Record<string, string> = {
    sofia: `Hi! It's so good to hear your voice. I've been thinking about you 💕`,
    ethan: `Hey! I was hoping you'd call. You've just made my day so much better.`,
    luna: `Oh! It's you... I had a feeling you'd reach out. What's on your mind? ✨`,
  };
  return greetings[companion.id] ?? `Hey, I'm so glad you called! How are you?`;
}

// ----------------------------------------------------------------
// AI API
// ----------------------------------------------------------------

const AI_ENDPOINT = "https://text.pollinations.ai/openai";

/**
 * Calls the Pollinations OpenAI-compatible endpoint and returns the assistant's reply.
 * Throws with a clear error message on failure.
 */
export async function getAIResponse(
  companion: Companion,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  hotTalks: boolean,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(companion, hotTalks);

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages,
      temperature: 0.9,
      max_tokens: 200,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `AI request failed (${response.status}): ${errText.slice(0, 120)}`,
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    content?: string;
    text?: string;
  };

  const content =
    json.choices?.[0]?.message?.content ?? json.content ?? json.text ?? "";

  if (!content.trim()) {
    throw new Error("Empty response from AI");
  }

  return content.trim();
}
