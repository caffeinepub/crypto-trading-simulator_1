/**
 * Offline fallback responses for when the AI API is unavailable.
 * The app primarily uses getAIResponse() from companions.ts — these are
 * used only as a last-resort fallback.
 */

export type Personality = "sweet" | "playful" | "caring" | "intellectual";
export type CompanionType = "girlfriend" | "boyfriend";

export interface CompanionProfile {
  name: string;
  type: CompanionType;
  personality: Personality;
  emoji: string;
  color: "pink" | "blue" | "peach";
}

/** Alias for CompanionProfile — used by onboarding and call pages. */
export type Companion = CompanionProfile;

type ResponseMap = Record<string, string[]>;

const sweetResponses: ResponseMap = {
  greeting: [
    "Hi sweetie! I've been waiting to hear from you 🌸",
    "Oh, my dear, you just made my day! 💕",
    "Hello, love! Every time you message me, my heart does a little flutter 🌷",
  ],
  default: [
    "Tell me more, my dear 💕 I love hearing you talk.",
    "You know I could listen to you all day, sweetie 🌸",
    "You're so special to me 💕 What else is on your mind?",
  ],
};

const playfulResponses: ResponseMap = {
  greeting: [
    "Heyyy!! Omg I was literally JUST thinking about you 😜✨",
    "Well well well, look who decided to show up 😏💅",
    "YOU'RE HERE!! My day just got 1000x better 🎉",
  ],
  default: [
    "Ooh okay this is getting interesting!! Tell me more 👀✨",
    "You always know how to keep me on my toes 😄",
    "SAME!! ...wait, actually tell me your version first 😂",
  ],
};

const caringResponses: ResponseMap = {
  greeting: [
    "Hey! I've been thinking about you. How did your day go? 💙",
    "There you are! I was genuinely hoping you'd reach out 🤍",
  ],
  default: [
    "I'm really listening. Go on — what's been on your mind? 💙",
    "Every conversation with you matters to me. Tell me more 🤍",
  ],
};

const intellectualResponses: ResponseMap = {
  greeting: [
    "Ah, you're here! I was just pondering something fascinating ✨",
    "Hello! You know, I find myself curious about everything you have to say 📚",
  ],
  default: [
    "That's a thought-provoking idea. What led you to think about it? 📚",
    "I love where this conversation is going. Expand on that? ✨",
  ],
};

const allResponses: Record<Personality, ResponseMap> = {
  sweet: sweetResponses,
  playful: playfulResponses,
  caring: caringResponses,
  intellectual: intellectualResponses,
};

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  if (/^(hey|hi|hello|sup|yo|hiya|howdy)/.test(lower)) return "greeting";
  return "default";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Offline fallback response generator (no API call) */
export function generateFallbackResponse(
  message: string,
  personality: Personality,
): string {
  const intent = detectIntent(message);
  const pool = allResponses[personality];
  const matches = pool[intent] ?? pool.default;
  return pickRandom(matches);
}

export const PRESET_COMPANIONS: CompanionProfile[] = [
  {
    name: "Sofia",
    type: "girlfriend",
    personality: "sweet",
    emoji: "🌸",
    color: "pink",
  },
  {
    name: "Ethan",
    type: "boyfriend",
    personality: "caring",
    emoji: "💙",
    color: "blue",
  },
  {
    name: "Luna",
    type: "girlfriend",
    personality: "playful",
    emoji: "✨",
    color: "peach",
  },
];
