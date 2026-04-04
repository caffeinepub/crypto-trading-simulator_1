import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Companion, CompanionType, Personality } from "@/lib/aiResponses";
import { ArrowLeft, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useState } from "react";

interface OnboardingPageProps {
  onComplete: (companion: Companion) => void;
  onBack: () => void;
}

const PERSONALITY_OPTIONS: {
  value: Personality;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  {
    value: "sweet",
    label: "Sweet",
    desc: "Gentle, warm, uses terms of endearment",
    emoji: "🌸",
  },
  {
    value: "playful",
    label: "Playful",
    desc: "Fun, teasing, full of energy and emoji",
    emoji: "✨",
  },
  {
    value: "caring",
    label: "Caring",
    desc: "Deep, attentive, emotionally supportive",
    emoji: "💙",
  },
  {
    value: "intellectual",
    label: "Intellectual",
    desc: "Thoughtful, curious, engages your mind",
    emoji: "📚",
  },
];

const EMOJI_OPTIONS = [
  "🌸",
  "💕",
  "🌺",
  "✨",
  "💙",
  "🌙",
  "⭐",
  "🦋",
  "🌿",
  "🎀",
];

export default function OnboardingPage({
  onComplete,
  onBack,
}: OnboardingPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<CompanionType>("girlfriend");
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState<Personality>("sweet");
  const [emoji, setEmoji] = useState("🌸");

  const handleComplete = () => {
    const companion: Companion = {
      name: name.trim() || (type === "girlfriend" ? "Aria" : "Kai"),
      type,
      personality,
      emoji,
      color:
        personality === "sweet"
          ? "pink"
          : personality === "caring"
            ? "blue"
            : "peach",
    };
    onComplete(companion);
  };

  const canProceed =
    step === 1 ? true : step === 2 ? name.trim().length > 0 : true;

  return (
    <div className="min-h-screen gradient-hero flex flex-col font-sans">
      {/* Header */}
      <header className="bg-hf-peach-header shadow-xs">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-full hover:bg-hf-blush transition-colors"
            aria-label="Go back"
            data-ocid="onboarding.back.button"
          >
            <ArrowLeft className="w-5 h-5 text-hf-brown" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-hf-rose heartbeat fill-current" />
            <span className="font-display text-lg font-bold text-hf-brown">
              Heartfelt AI
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white/50 h-1">
        <div
          className="h-full bg-hf-rose transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s <= step
                      ? "bg-hf-rose text-white"
                      : "bg-white/70 text-hf-body"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-0.5 ${s < step ? "bg-hf-rose" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-deep p-8 animate-fade-in">
            {/* Step 1: Choose Type */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-3">💫</div>
                  <h2 className="font-display text-3xl font-bold text-hf-brown mb-2">
                    Who are you looking for?
                  </h2>
                  <p className="text-hf-body">
                    Choose the type of AI companion you&apos;d like.
                  </p>
                </div>

                <div
                  className="grid grid-cols-2 gap-5 mb-8"
                  data-ocid="onboarding.type.select"
                >
                  {[
                    {
                      value: "girlfriend" as CompanionType,
                      emoji: "🌸",
                      label: "Girlfriend",
                      desc: "A warm, loving female AI companion",
                    },
                    {
                      value: "boyfriend" as CompanionType,
                      emoji: "💙",
                      label: "Boyfriend",
                      desc: "A caring, supportive male AI companion",
                    },
                  ].map(({ value, emoji: e, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`p-6 rounded-2xl border-2 text-center transition-all hover:scale-105 ${
                        type === value
                          ? "border-hf-rose bg-hf-blush"
                          : "border-border bg-muted/30 hover:border-hf-rose/50"
                      }`}
                      data-ocid={`onboarding.${value}.toggle`}
                    >
                      <div className="text-4xl mb-3">{e}</div>
                      <p className="font-semibold text-hf-brown text-sm">
                        {label}
                      </p>
                      <p className="text-xs text-hf-body mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Name & Emoji */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-3">{emoji}</div>
                  <h2 className="font-display text-3xl font-bold text-hf-brown mb-2">
                    Give them a name
                  </h2>
                  <p className="text-hf-body">
                    What will you call your {type}?
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="companion-name"
                      className="text-hf-brown font-medium mb-2 block"
                    >
                      Companion name
                    </Label>
                    <Input
                      id="companion-name"
                      placeholder={
                        type === "girlfriend"
                          ? "e.g. Aria, Mia, Zara..."
                          : "e.g. Kai, Leo, Zion..."
                      }
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && canProceed && setStep(3)
                      }
                      className="rounded-xl border-border text-hf-brown placeholder:text-hf-body/50 focus:border-hf-rose"
                      maxLength={20}
                      data-ocid="onboarding.name.input"
                    />
                  </div>

                  <div>
                    <Label className="text-hf-brown font-medium mb-3 block">
                      Choose their avatar emoji
                    </Label>
                    <div className="grid grid-cols-5 gap-3">
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmoji(e)}
                          className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                            emoji === e
                              ? "bg-hf-blush border-2 border-hf-rose scale-110"
                              : "bg-muted/30 border border-border hover:bg-hf-blush/50"
                          }`}
                          data-ocid="onboarding.emoji.toggle"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-3">🎭</div>
                  <h2 className="font-display text-3xl font-bold text-hf-brown mb-2">
                    Pick their personality
                  </h2>
                  <p className="text-hf-body">
                    How should {name || "they"} communicate with you?
                  </p>
                </div>

                <div
                  className="space-y-3 mb-6"
                  data-ocid="onboarding.personality.select"
                >
                  {PERSONALITY_OPTIONS.map(
                    ({ value, label, desc, emoji: e }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPersonality(value)}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all hover:scale-[1.02] ${
                          personality === value
                            ? "border-hf-rose bg-hf-blush"
                            : "border-border hover:border-hf-rose/50"
                        }`}
                        data-ocid={`onboarding.${value}.toggle`}
                      >
                        <span className="text-2xl">{e}</span>
                        <div>
                          <p className="font-semibold text-hf-brown">{label}</p>
                          <p className="text-xs text-hf-body">{desc}</p>
                        </div>
                        {personality === value && (
                          <Badge className="ml-auto bg-hf-rose text-white border-0 text-xs">
                            Selected
                          </Badge>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="flex-1 rounded-xl border-border text-hf-body hover:bg-muted"
                  data-ocid="onboarding.prev.button"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  disabled={!canProceed}
                  className="flex-1 bg-hf-rose hover:bg-accent text-white rounded-xl transition-all"
                  data-ocid="onboarding.next.button"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-hf-rose hover:bg-accent text-white rounded-xl transition-all"
                  data-ocid="onboarding.start_chat.primary_button"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Start Chatting!
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
