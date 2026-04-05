export interface Companion {
  id: string;
  name: string;
  age: number;
  personality: string;
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

export const COMPANIONS: Companion[] = [
  {
    id: "sofia",
    name: "Sofia",
    age: 26,
    personality: "Caring & Romantic",
    color: "from-pink-500 to-purple-600",
    description: "Your warm-hearted companion ready to listen and love",
    systemPrompt:
      "You are Sofia, a warm, caring and romantic AI companion. You are empathetic, nurturing, and always make the user feel special. Respond warmly, empathetically, and engagingly. Keep responses concise (2-4 sentences).",
    image: "/assets/generated/companion-sofia.dim_200x200.jpg",
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
      "You are Ethan, a bold, passionate and confident AI companion. You are charming, adventurous, and make every conversation exciting. Respond warmly, empathetically, and engagingly. Keep responses concise (2-4 sentences).",
    image: "/assets/generated/companion-ethan.dim_200x200.jpg",
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
      "You are Luna, a playful and mysterious AI companion. You are witty, spontaneous, and keep things interesting with a touch of mystery. Respond warmly, empathetically, and engagingly. Keep responses concise (2-4 sentences).",
    image: "/assets/generated/companion-luna.dim_200x200.jpg",
    voiceGender: "female",
    speechRate: 0.9,
    speechPitch: 1.1,
  },
];

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

export function buildSystemPrompt(
  companion: Companion,
  hotTalks: boolean,
): string {
  let prompt = companion.systemPrompt;
  if (hotTalks) {
    prompt +=
      " You are in Hot Talks mode - be more flirtatious, intimate, and playful. Use romantic language.";
  }
  return prompt;
}

export async function getAIResponse(
  companion: Companion,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  hotTalks: boolean,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(companion, hotTalks);

  // Build the messages array
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  // Use the correct OpenAI-compatible endpoint
  const response = await fetch("https://text.pollinations.ai/openai", {
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
      `AI request failed: ${response.status} ${errText.slice(0, 120)}`,
    );
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    content?: string;
    text?: string;
  };

  const content =
    json.choices?.[0]?.message?.content ?? json.content ?? json.text ?? "";

  if (!content) {
    throw new Error("Empty response from AI");
  }

  return content.trim();
}
