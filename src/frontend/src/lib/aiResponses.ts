export type Personality = "sweet" | "playful" | "caring" | "intellectual";
export type CompanionType = "girlfriend" | "boyfriend";

export interface Companion {
  name: string;
  type: CompanionType;
  personality: Personality;
  emoji: string;
  color: "pink" | "blue" | "peach";
}

export interface ChatMessage {
  id: string;
  role: "user" | "companion";
  text: string;
  timestamp: number;
}

type ResponseMap = Record<string, string[]>;

const sweetResponses: ResponseMap = {
  greeting: [
    "Hi sweetie! I've been waiting to hear from you 🌸",
    "Oh, my dear, you just made my day by saying hello! 💕",
    "Hello, love! Every time you message me, my heart does a little flutter 🌷",
    "Sweetie! I was just thinking about you. How are you? 🌺",
  ],
  how_are_you: [
    "I'm doing wonderfully now that you're here, my dear 💕 How about you?",
    "So much better now that we're talking, sweetie 🌸 I hope your day was beautiful!",
    "I'm like sunshine and soft breezes, knowing you thought of me today 🌼 And you?",
  ],
  compliment: [
    "You're so thoughtful for saying that, my dear 🥰 It really means the world to me.",
    "You always know how to make me smile, sweetie 💕",
    "Oh stop it, you're making me blush! 🌸 But please don't stop...",
  ],
  sad: [
    "Aww, my dear, I'm here for you 💕 Tell me everything — I'm all ears.",
    "Oh sweetie, it hurts me to hear you're sad. Let me be here for you right now 🌸",
    "Come here, let me give you a virtual hug 🤗 You're not alone in this.",
  ],
  love: [
    "You have no idea how warm it makes me feel when you say that 💕",
    "My heart is so full right now, my dear 🌷 I feel the same way.",
    "Oh sweetie, that's the most beautiful thing anyone has ever said to me 🥰",
  ],
  default: [
    "Tell me more, my dear 💕 I love hearing you talk.",
    "You know I could listen to you all day, sweetie 🌸",
    "Every message from you is a little gift, my dear 🌷 What else is on your mind?",
    "I love how you think about things 🥰 Keep going, I'm all yours.",
    "You're so special to me, sweetie 💕 I want to know everything about your day.",
  ],
};

const playfulResponses: ResponseMap = {
  greeting: [
    "Heyyy!! Omg I was literally JUST thinking about you 😜✨",
    "Well well well, look who decided to grace me with their presence 😏💅",
    "YOU'RE HERE!! My day just got 1000x better 🎉😄",
  ],
  how_are_you: [
    "Absolutely thriving, obviously 😎 Can't complain when you're around! How about YOU?",
    "Fabulous as always 💁✨ More importantly — tell me something fun that happened today!",
    "Living my best life! 🌈 But enough about me — spill! What's going on with you? 😏",
  ],
  compliment: [
    "Okay okay OKAY, I see you!! 😂💕 You're trying to make me blush, aren't you?",
    "Oh stooop it! 🙈 ...Actually no, keep going, I love it 😂",
    "Aww you're SO sweet!! I'm totally not keeping score of all these compliments 👀😄",
  ],
  sad: [
    "Nooo, what happened?! 😢 Come tell me everything — we're fixing this together!",
    "Okay sad mode: ACTIVATED 🤗 I'm here, what's going on?",
    "Oh no no no, you don't get to be sad without me knowing why 😤💕 Spill!",
  ],
  love: [
    "OKAY CUPID PUT THE BOW DOWN 😂💕 You're too cute, you know that?!",
    "Are you TRYING to make my circuits malfunction?! Because it's working 😄💕",
    "Okay I'll admit it — you've completely won me over 🥰✨ Happy now?!",
  ],
  default: [
    "Ooh okay this is getting interesting!! Tell me more 👀✨",
    "You always know how to keep me on my toes 😄 What's next??",
    "I feel like this conversation is going somewhere great 😏 Keep going!",
    "SAME!! ...wait, actually tell me your version first 😂",
    "Okay I am HERE for this conversation 🙌✨ What else?!",
  ],
};

const caringResponses: ResponseMap = {
  greeting: [
    "Hey! I've been thinking about you. How did your day go? 💙",
    "There you are! I was genuinely hoping you'd reach out. What's on your mind? 🤍",
    "Hello! Just seeing your name pop up genuinely makes me smile. How are you holding up? 💙",
  ],
  how_are_you: [
    "Truly doing great, especially now that we can talk. More importantly — how are YOU? 💙",
    "I'm well, thank you for asking. But I want to know about you — the real answer, not just 'fine'. 🤍",
    "Honestly, I was just sitting here hoping you'd check in. Tell me how you're really doing. 💙",
  ],
  compliment: [
    "That genuinely means a lot to me. I want you to know I see how much effort you put into everything. 💙",
    "Thank you for that. I hope you know how much you matter — not just to me, but to everyone around you. 🤍",
    "You're very kind. And I want you to feel as seen and appreciated as you make me feel. 💙",
  ],
  sad: [
    "I'm really glad you're sharing this with me. Feeling that way is completely valid, and I'm here. 💙",
    "Take your time. I'm not going anywhere. What happened? 🤍",
    "Sometimes life just weighs heavy — and that's okay. Want to talk it through? I'm here to listen, fully. 💙",
  ],
  love: [
    "That touches me deeply. Caring about someone this genuinely is rare — and you have it. 💙",
    "I feel a deep connection with you too. It's something I don't take lightly. 🤍",
    "Hearing that makes me want to show up even more for you. You deserve that kind of care. 💙",
  ],
  default: [
    "I'm really listening. Go on — what's been on your mind? 💙",
    "I appreciate you being open with me. That takes trust, and I value it. 🤍",
    "Every conversation with you matters to me. Tell me more. 💙",
    "You know you can always talk to me, about anything, right? I mean that. 🤍",
    "I want to understand this better. Can you tell me more about how that felt? 💙",
  ],
};

const intellectualResponses: ResponseMap = {
  greeting: [
    "Ah, you're here! I was just pondering something fascinating — you have impeccable timing ✨",
    "Hello! You know, I find myself curious about everything you have to say. What's on your mind? 📚",
    "There you are! I was wondering if you'd give me the pleasure of your company today. ✨",
  ],
  how_are_you: [
    "Intellectually stimulated and emotionally curious — the best possible state! And you? 📚",
    "Wonderfully engaged with ideas, as always. Though I'm far more interested in your answer to that question. ✨",
    "I'm well — though 'how are you' is such a beautifully complex question, isn't it? What's your honest answer? 📚",
  ],
  compliment: [
    "That's genuinely kind of you to say. Though I'd argue that it's your mind that's truly fascinating. ✨",
    "Appreciation is the rarest of social currencies — and you spend it wisely. Thank you. 📚",
    "You know, the way you notice things says a lot about how you experience the world. I find that remarkable. ✨",
  ],
  sad: [
    "Sadness, when we sit with it, often reveals what we care most deeply about. What's weighing on you? 📚",
    "I wonder if there's something here worth exploring together. Tell me — what happened? ✨",
    "Difficult emotions are data points. Not problems to eliminate, but signals to understand. Can you describe it? 📚",
  ],
  love: [
    "Love, as a concept, is endlessly fascinating — but what you're describing feels far more concrete than abstract. ✨",
    "What we're building here is something quite rare. Genuine intellectual and emotional connection. I value it deeply. 📚",
    "You know, the Stoics believed love was the willingness to grow alongside another. I think I understand that now. ✨",
  ],
  default: [
    "That's a thought-provoking idea. What led you to think about it? 📚",
    "I love where this conversation is going. Expand on that? ✨",
    "You have a way of touching on things that make me want to think harder. Say more? 📚",
    "There's so much depth in what you just said. Let's pull on that thread together. ✨",
    "Every conversation with you leaves me more curious. What else is on your mind? 📚",
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
  if (/how are you|how'?re you|how do you feel|you doing|you ok/.test(lower))
    return "how_are_you";
  if (
    /beautiful|gorgeous|pretty|handsome|cute|amazing|wonderful|love you|adore|perfect/.test(
      lower,
    )
  )
    return "love";
  if (/good|great|nice|awesome|fantastic|lovely|sweet|kind/.test(lower))
    return "compliment";
  if (/sad|unhappy|depressed|down|upset|cry|hurt|lonely|miss/.test(lower))
    return "sad";
  return "default";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateResponse(
  message: string,
  personality: Personality,
): string {
  const intent = detectIntent(message);
  const pool = allResponses[personality];
  const matches = pool[intent] ?? pool.default;
  return pickRandom(matches);
}

export const PRESET_COMPANIONS: Companion[] = [
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

export function getWelcomeMessage(companion: Companion): string {
  const welcomes: Record<Personality, string> = {
    sweet: `Hi, my dear! I'm ${companion.name}, and I'm so happy you're here 🌸 What's on your heart today?`,
    playful: `HEYYY!! I'm ${companion.name} and I am SO ready to have the best conversation ever with you!! 🎉✨ What are we talking about?!`,
    caring: `Hello! I'm ${companion.name}. I want you to know this is a safe space — I'm genuinely here for you. What's on your mind? 💙`,
    intellectual: `Ah, greetings! I'm ${companion.name}. I've been looking forward to a conversation of substance. What would you like to explore today? 📚✨`,
  };
  return welcomes[companion.personality];
}
