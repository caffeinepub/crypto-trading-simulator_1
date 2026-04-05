import { useSaveCompanionPreference } from "@/hooks/useQueries";
import {
  COMPANIONS,
  type Companion,
  saveCompanionToStorage,
} from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const customPersonalities = [
  { label: "Caring & Romantic", value: "Caring & Romantic" },
  { label: "Bold & Passionate", value: "Bold & Passionate" },
  { label: "Playful & Mysterious", value: "Playful & Mysterious" },
  { label: "Sweet & Nurturing", value: "Sweet & Nurturing" },
];

export default function SelectPage() {
  const navigate = useNavigate();
  const savePreference = useSaveCompanionPreference();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPersonality, setCustomPersonality] = useState(
    customPersonalities[0].value,
  );

  const handleSelect = (companion: Companion) => {
    saveCompanionToStorage(companion);
    savePreference.mutate(companion.id);
    navigate({ to: "/chat" });
  };

  const handleCustomCreate = () => {
    if (!customName.trim()) return;
    const custom: Companion = {
      id: "custom",
      name: customName.trim(),
      age: 25,
      personality: customPersonality,
      color: "from-violet-500 to-pink-600",
      description: `Your custom companion \u2014 ${customPersonality.toLowerCase()}`,
      systemPrompt: `You are ${customName.trim()}, a ${customPersonality.toLowerCase()} AI companion. Respond warmly, empathetically, and engagingly. Keep responses concise (2-4 sentences).`,
      image: "",
      voiceGender: "female",
      speechRate: 0.9,
      speechPitch: 1.1,
    };
    saveCompanionToStorage(custom);
    savePreference.mutate(custom.id);
    navigate({ to: "/chat" });
  };

  return (
    <div className="min-h-screen gradient-hero-bg text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-white/30 transition-all"
            data-ocid="select.back.button"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Choose Your Companion
            </h1>
            <p className="text-body text-sm">
              Select who you'd like to connect with
            </p>
          </div>
        </div>

        {/* Companion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {COMPANIONS.map((c, i) => (
            <motion.div
              key={c.id}
              className="glass-card rounded-3xl p-6 flex flex-col items-center text-center gap-4 cursor-pointer hover:border-white/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              data-ocid={`select.companion.item.${i + 1}`}
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-br ${c.color} ring-pulse overflow-hidden`}
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                      {c.name[0]}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  {c.name}
                </h3>
                <p className="text-muted-neon text-xs">Age {c.age}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {c.personality.split(" & ").map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-neon-violet border border-neon-violet/30 bg-neon-violet/10 px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-body text-sm leading-relaxed">
                {c.description}
              </p>
              <button
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full gradient-neon-btn text-white font-semibold py-2.5 rounded-full hover:opacity-90 transition-all"
                data-ocid={`select.choose.button.${i + 1}`}
              >
                Choose {c.name}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Custom Companion */}
        <motion.div
          className="glass-card rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <button
            type="button"
            className="w-full flex items-center gap-3 text-left"
            onClick={() => setShowCustom(!showCustom)}
            data-ocid="select.custom.toggle"
          >
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-neon-violet" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Create Custom Companion
              </p>
              <p className="text-body text-sm">Design your ideal AI partner</p>
            </div>
            <Sparkles className="ml-auto w-4 h-4 text-neon-pink" />
          </button>

          {showCustom && (
            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label
                  htmlFor="custom-name"
                  className="text-sm text-white/70 block mb-1.5"
                >
                  Companion Name
                </label>
                <input
                  id="custom-name"
                  type="text"
                  placeholder="e.g. Aria, Zara, Max..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50 placeholder:text-white/25"
                  data-ocid="select.custom.name.input"
                />
              </div>
              <div>
                <label
                  htmlFor="custom-personality"
                  className="text-sm text-white/70 block mb-1.5"
                >
                  Personality Type
                </label>
                <select
                  id="custom-personality"
                  value={customPersonality}
                  onChange={(e) => setCustomPersonality(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-violet/50"
                  data-ocid="select.custom.personality.select"
                >
                  {customPersonalities.map((p) => (
                    <option
                      key={p.value}
                      value={p.value}
                      className="bg-gray-900"
                    >
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleCustomCreate}
                disabled={!customName.trim()}
                className="w-full gradient-neon-btn text-white font-semibold py-2.5 rounded-full disabled:opacity-40 hover:opacity-90 transition-all"
                data-ocid="select.custom.create.button"
              >
                Create &amp; Start Chatting
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
