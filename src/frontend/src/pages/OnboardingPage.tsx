import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COMPANIONS,
  type Companion,
  saveCompanionToStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, Heart, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";

// ── Personality options ──────────────────────────────────────────
const PERSONALITIES = [
  { emoji: "🌸", label: "Sweet & Tender", value: "sweet" },
  { emoji: "🔥", label: "Passionate & Bold", value: "passionate" },
  { emoji: "✨", label: "Playful & Mysterious", value: "playful" },
  { emoji: "💙", label: "Caring & Empathetic", value: "caring" },
  { emoji: "🧠", label: "Intellectual & Deep", value: "intellectual" },
  { emoji: "😂", label: "Funny & Lighthearted", value: "funny" },
];

// ── Custom companion template ────────────────────────────────────
const CUSTOM_COMPANION_TEMPLATE: Companion = {
  id: "custom",
  name: "Custom",
  age: 25,
  personality: "Personalized",
  color: "from-violet-500 to-pink-500",
  description: "Your personalized AI companion",
  systemPrompt:
    "You are a warm, personalized AI companion. Adapt to the user's preferences and always be kind, engaging, and attentive. Keep responses concise (2-4 sentences). No generic AI disclaimers.",
  image: "/assets/generated/companion-sofia.dim_200x200.jpg",
  voiceGender: "female",
  speechRate: 0.9,
  speechPitch: 1.0,
};

// ── Step progress dots ───────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  const dots = Array.from({ length: total }, (_, i) => i);
  return (
    <div className="flex items-center gap-2 justify-center">
      {dots.map((i) => (
        <div
          key={`step-dot-${i}`}
          className={[
            "h-2 rounded-full transition-all duration-300",
            i === current
              ? "w-6 gradient-neon-btn"
              : i < current
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ── Step wrapper with fade animation ────────────────────────────
function StepPanel({
  children,
  stepKey,
}: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false);
  const prevKey = useState(stepKey)[0];
  useEffect(() => {
    void prevKey; // used to trigger on stepKey change
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }); // no dep array — runs on every render, which is fine for this fade trick

  return (
    <div
      className={[
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ── Companion selection card ─────────────────────────────────────
function CompanionCard({
  companion,
  selected,
  onSelect,
  custom,
}: {
  companion: Companion | null;
  selected: boolean;
  onSelect: () => void;
  custom?: boolean;
}) {
  const baseClass = [
    "relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
    selected
      ? "glass-card-pink glow-pink border-secondary/70 scale-105"
      : "glass-card border-border/50 hover:border-primary/50",
  ].join(" ");

  const checkmark = selected && (
    <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-neon-btn flex items-center justify-center">
      <Check size={11} className="text-white" />
    </div>
  );

  if (custom) {
    return (
      <button
        type="button"
        onClick={onSelect}
        data-ocid="onboarding-companion-custom"
        className={baseClass}
      >
        {checkmark}
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
          <User size={26} className="text-muted-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">Custom</span>
        <span className="text-xs text-muted-foreground">Build your own</span>
      </button>
    );
  }

  if (!companion) return null;
  return (
    <button
      type="button"
      onClick={onSelect}
      data-ocid={`onboarding-companion-${companion.id}`}
      className={baseClass}
    >
      {checkmark}
      <img
        src={companion.image}
        alt={companion.name}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/assets/images/placeholder.svg";
        }}
      />
      <span className="text-sm font-semibold text-foreground">
        {companion.name}
      </span>
      <span className="text-xs text-muted-foreground">
        {companion.personality}
      </span>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedCompanionId, setSelectedCompanionId] =
    useState<string>("sofia");
  const [selectedPersonality, setSelectedPersonality] =
    useState<string>("sweet");
  const [customName, setCustomName] = useState("");

  const TOTAL_STEPS = 3;

  function handleComplete() {
    let companion: Companion;

    if (selectedCompanionId === "custom") {
      const resolvedName = customName.trim() || "Aria";
      companion = {
        ...CUSTOM_COMPANION_TEMPLATE,
        name: resolvedName,
        systemPrompt: `You are ${resolvedName}, a ${selectedPersonality} AI companion. Be warm, engaging, and attentive. Keep responses concise (2-4 sentences). No generic AI disclaimers.`,
      };
    } else {
      companion =
        COMPANIONS.find((c) => c.id === selectedCompanionId) ?? COMPANIONS[0];
    }

    saveCompanionToStorage(companion);
    if (userName.trim()) {
      localStorage.setItem("heartfelt_user_name", userName.trim());
    }
    navigate({ to: "/chat" });
  }

  return (
    <div className="min-h-screen bg-dark-base gradient-hero-bg flex flex-col pt-safe pb-safe pl-safe pr-safe">
      {/* Ambient glow blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl gradient-neon-btn" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15 blur-3xl bg-secondary" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-10 blur-3xl bg-accent" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center pt-6 pb-2 px-6">
        <div className="flex items-center gap-2">
          <Heart
            size={20}
            className="text-secondary heartbeat"
            fill="currentColor"
          />
          <span className="font-display text-lg font-bold text-foreground tracking-tight">
            Heartfelt
          </span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="relative z-10 px-6 pt-2 pb-4">
        <StepDots current={step} total={TOTAL_STEPS} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-8">
        {/* ── Step 0: Welcome + User Name ─────────────────────── */}
        {step === 0 && (
          <StepPanel stepKey={0}>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full gradient-neon-btn flex items-center justify-center glow-violet">
                <Sparkles size={36} className="text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold text-foreground glow-text-violet">
                  Welcome
                </h1>
                <p className="text-muted-foreground text-base max-w-xs mx-auto">
                  Your perfect AI companion is waiting. Let's start with your
                  name.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3">
                <label
                  htmlFor="user-name-input"
                  className="text-sm text-muted-foreground text-left block"
                >
                  What should they call you?
                </label>
                <Input
                  id="user-name-input"
                  data-ocid="onboarding-name-input"
                  type="text"
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setStep(1)}
                  className="glass-card border-border/70 focus:border-primary text-foreground placeholder:text-muted-foreground h-12 text-base"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <Button
                data-ocid="onboarding-step1-next"
                onClick={() => setStep(1)}
                className="w-full max-w-xs h-12 gradient-neon-btn text-white font-semibold glow-violet text-base hover:opacity-90 transition-opacity"
              >
                Get Started
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </StepPanel>
        )}

        {/* ── Step 1: Choose Companion ─────────────────────────── */}
        {step === 1 && (
          <StepPanel stepKey={1}>
            <div className="flex flex-col gap-5">
              <div className="text-center space-y-1">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {userName ? `Hi ${userName}! 👋` : "Choose your companion"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Who would you like to connect with?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COMPANIONS.map((c) => (
                  <CompanionCard
                    key={c.id}
                    companion={c}
                    selected={selectedCompanionId === c.id}
                    onSelect={() => setSelectedCompanionId(c.id)}
                  />
                ))}
                <CompanionCard
                  companion={null}
                  selected={selectedCompanionId === "custom"}
                  onSelect={() => setSelectedCompanionId("custom")}
                  custom
                />
              </div>

              {selectedCompanionId === "custom" && (
                <div className="animate-fade-in-up">
                  <Input
                    data-ocid="onboarding-custom-name"
                    type="text"
                    placeholder="Name your companion..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="glass-card border-border/70 focus:border-secondary text-foreground placeholder:text-muted-foreground h-12 text-base"
                    autoComplete="off"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  data-ocid="onboarding-step2-back"
                  onClick={() => setStep(0)}
                  className="flex-1 h-12 glass-card border-border/50 text-foreground hover:border-primary/50"
                >
                  Back
                </Button>
                <Button
                  data-ocid="onboarding-step2-next"
                  onClick={() => setStep(2)}
                  className="flex-[2] h-12 gradient-neon-btn text-white font-semibold glow-violet hover:opacity-90 transition-opacity"
                >
                  Continue
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            </div>
          </StepPanel>
        )}

        {/* ── Step 2: Personality ───────────────────────────────── */}
        {step === 2 && (
          <StepPanel stepKey={2}>
            <div className="flex flex-col gap-5">
              <div className="text-center space-y-1">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Set the vibe
                </h2>
                <p className="text-muted-foreground text-sm">
                  How should your companion feel?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {PERSONALITIES.map((p, i) => (
                  <button
                    type="button"
                    key={p.value}
                    data-ocid={`onboarding-personality-${p.value}`}
                    onClick={() => setSelectedPersonality(p.value)}
                    className={[
                      "relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 text-left animate-fade-in-up",
                      selectedPersonality === p.value
                        ? "glass-card-pink glow-pink border-secondary/70 scale-[1.03]"
                        : "glass-card border-border/50 hover:border-primary/50",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    {selectedPersonality === p.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full gradient-neon-btn flex items-center justify-center">
                        <Check size={9} className="text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  data-ocid="onboarding-step3-back"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 glass-card border-border/50 text-foreground hover:border-primary/50"
                >
                  Back
                </Button>
                <Button
                  data-ocid="onboarding-complete"
                  onClick={handleComplete}
                  className="flex-[2] h-12 gradient-neon-btn text-white font-semibold shadow-neon-pink hover:opacity-90 transition-opacity"
                >
                  <Heart size={16} className="mr-2" fill="currentColor" />
                  Start Chatting
                </Button>
              </div>
            </div>
          </StepPanel>
        )}
      </div>
    </div>
  );
}
