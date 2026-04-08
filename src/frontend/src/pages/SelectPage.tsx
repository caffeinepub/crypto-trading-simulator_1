import { useSaveCompanionPreference } from "@/hooks/useQueries";
import {
  COMPANIONS,
  type Companion,
  saveCompanionToStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Heart, Sparkles, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CUSTOM_PERSONALITIES = [
  "Cheerful & Bubbly",
  "Intellectual & Deep",
  "Adventurous & Wild",
  "Calm & Soothing",
];

const ACCENT: Record<string, { glow: string; ring: string; badge: string }> = {
  sofia: {
    glow: "glow-pink",
    ring: "ring-2 ring-neon-pink/60",
    badge: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
  },
  ethan: {
    glow: "glow-violet",
    ring: "ring-2 ring-neon-violet/60",
    badge: "bg-neon-violet/10 text-neon-violet border-neon-violet/30",
  },
  luna: {
    glow: "glow-violet",
    ring: "ring-2 ring-neon-violet/60",
    badge: "bg-neon-violet/10 text-neon-violet border-neon-violet/30",
  },
};

const TRAITS: Record<string, string[]> = {
  sofia: ["Empathetic", "Nurturing", "Romantic"],
  ethan: ["Bold", "Confident", "Adventurous"],
  luna: ["Playful", "Mysterious", "Witty"],
};

export default function SelectPage() {
  const navigate = useNavigate();
  const savePreference = useSaveCompanionPreference();
  const [selected, setSelected] = useState<Companion | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPersonality, setCustomPersonality] = useState(
    CUSTOM_PERSONALITIES[0],
  );

  function pickPreset(companion: Companion) {
    setSelected(companion);
    setShowCustom(false);
  }

  function confirm() {
    let companion: Companion;

    if (showCustom && customName.trim()) {
      companion = {
        id: `custom_${Date.now()}`,
        name: customName.trim(),
        age: 25,
        personality: customPersonality,
        color: "from-violet-500 to-pink-600",
        description: `Your custom ${customPersonality.toLowerCase()} companion`,
        systemPrompt: `You are ${customName.trim()}, a ${customPersonality.toLowerCase()} AI companion. Be warm, engaging, and make the user feel special. Keep responses concise (2-4 sentences). No generic AI disclaimers.`,
        image: COMPANIONS[2].image,
        voiceGender: "female",
        speechRate: 0.9,
        speechPitch: 1.05,
      };
    } else if (selected) {
      companion = selected;
    } else {
      return;
    }

    saveCompanionToStorage(companion);
    savePreference.mutate(companion.id, {
      onSettled: () => navigate({ to: "/chat" }),
    });
  }

  const isReady =
    selected !== null || (showCustom && customName.trim().length > 0);

  return (
    <div className="min-h-screen gradient-hero-bg overflow-x-hidden">
      {/* ── Header ─────────────────────────────────── */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50 pt-safe backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            type="button"
            data-ocid="nav-back"
            onClick={() => navigate({ to: "/" })}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Heart
              className="w-5 h-5 text-neon-pink heartbeat"
              fill="currentColor"
            />
            <span className="font-display font-bold text-foreground">
              Choose Your Companion
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-safe">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Who speaks to your{" "}
            <span className="text-neon-pink glow-text-pink">heart?</span>
          </h1>
          <p className="text-body text-lg max-w-xl mx-auto">
            Select a companion below or create a custom one that&rsquo;s
            uniquely yours.
          </p>
        </motion.div>

        {/* ── Companion Grid ─────────────────────────── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6"
          data-ocid="companion-grid"
        >
          {COMPANIONS.map((companion, i) => {
            const accent = ACCENT[companion.id] ?? ACCENT.luna;
            const traits = TRAITS[companion.id] ?? [];
            const isSelected = selected?.id === companion.id;

            return (
              <motion.div
                key={companion.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-ocid={`companion-card-${companion.id}`}
                onClick={() => pickPreset(companion)}
                className={`relative glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isSelected
                    ? `${accent.glow} ${accent.ring}`
                    : "hover:ring-1 hover:ring-border"
                }`}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full gradient-neon-btn flex items-center justify-center shadow-neon-pink">
                    <Check className="w-4 h-4 text-foreground" />
                  </div>
                )}

                {/* Photo */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={companion.image}
                    alt={companion.name}
                    className={`w-full h-full object-cover object-top transition-transform duration-500 ${
                      isSelected ? "scale-105" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display font-bold text-foreground text-xl">
                      {companion.name}, {companion.age}
                    </h3>
                    <p className="text-sm text-foreground/70">
                      {companion.personality}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-body text-sm mb-3 leading-relaxed">
                    {companion.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {traits.map((trait) => (
                      <span
                        key={trait}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${accent.badge}`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Custom Companion ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
        >
          <button
            type="button"
            data-ocid="custom-companion-toggle"
            onClick={() => {
              setShowCustom((v) => !v);
              setSelected(null);
            }}
            className={`w-full text-left glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              showCustom
                ? "ring-2 ring-neon-cyan/60 glow-cyan"
                : "hover:ring-1 hover:ring-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full glass-card border border-neon-cyan/40 glow-cyan flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-foreground text-base">
                  Create Your Own Companion
                </h3>
                <p className="text-body text-sm">
                  Design a companion uniquely tailored to you
                </p>
              </div>
              {showCustom ? (
                <div className="w-7 h-7 rounded-full gradient-neon-btn flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
              ) : (
                <Sparkles className="w-5 h-5 text-neon-pink flex-shrink-0" />
              )}
            </div>

            {showCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="custom-name"
                    className="text-foreground text-sm font-medium block"
                  >
                    Companion Name
                  </label>
                  <input
                    id="custom-name"
                    data-ocid="custom-name-input"
                    placeholder="e.g. Aria, Max, Zara..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-foreground text-sm font-medium">
                    Personality Style
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    data-ocid="personality-options"
                  >
                    {CUSTOM_PERSONALITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomPersonality(p)}
                        className={`text-xs font-medium px-3 py-2 rounded-full border transition-all ${
                          customPersonality === p
                            ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50 glow-cyan"
                            : "glass-card text-muted-foreground border-border hover:border-neon-cyan/30"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* ── Confirm ────────────────────────────────── */}
        <div className="text-center">
          <button
            type="button"
            data-ocid="confirm-companion"
            disabled={!isReady || savePreference.isPending}
            onClick={confirm}
            className={`gradient-neon-btn text-foreground font-bold text-lg px-12 py-4 rounded-full shadow-neon-pink glow-pink transition-all border-0 min-w-[240px] ${
              isReady && !savePreference.isPending
                ? "hover:scale-105 active:scale-95 opacity-100"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {savePreference.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {selected
                  ? `Start with ${selected.name}`
                  : showCustom
                    ? "Create Companion"
                    : "Select a Companion"}
              </span>
            )}
          </button>

          {!isReady && (
            <p className="text-muted-neon text-sm mt-3" data-ocid="select-hint">
              Choose a companion above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
