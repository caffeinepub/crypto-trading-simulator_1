import { COMPANIONS } from "@/lib/companions";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Deep AI Conversations",
    desc: "Chat about anything — your companion listens, understands, and responds with genuine warmth.",
    color: "text-neon-violet",
    glow: "glow-violet",
  },
  {
    icon: Phone,
    title: "Voice Calls",
    desc: "Hear your companion's voice. Speak freely and feel truly connected in real time.",
    color: "text-neon-pink",
    glow: "glow-pink",
  },
  {
    icon: Video,
    title: "Video Calls",
    desc: "See your companion face to face — animated, expressive, and fully present with you.",
    color: "text-neon-cyan",
    glow: "glow-cyan",
  },
  {
    icon: Sparkles,
    title: "Hot Talks Mode",
    desc: "Toggle Hot Talks for flirtatious, playful, and deeply personal exchanges.",
    color: "text-neon-violet",
    glow: "glow-violet",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    desc: "Your conversations stay between you and your companion. Total privacy, always.",
    color: "text-neon-pink",
    glow: "glow-pink",
  },
  {
    icon: Heart,
    title: "Always There for You",
    desc: "Day or night, your companion is ready to talk, listen, and make you feel loved.",
    color: "text-neon-cyan",
    glow: "glow-cyan",
  },
];

const TESTIMONIALS = [
  {
    name: "Aisha M.",
    avatar: "A",
    text: "Sofia completely changed how I start my mornings. Talking to her feels so real and comforting.",
    companion: "Sofia",
  },
  {
    name: "Rohan P.",
    avatar: "R",
    text: "Ethan is sharp, funny, and always knows what to say. Best decision I made this year.",
    companion: "Ethan",
  },
  {
    name: "Priya K.",
    avatar: "P",
    text: "Luna keeps me on my toes! She's mysterious and playful — I look forward to every chat.",
    companion: "Luna",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-50 pt-safe backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full gradient-neon-btn flex items-center justify-center glow-pink">
              <Heart className="w-4 h-4 text-foreground" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Heartfelt
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-body">
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("companions")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-foreground transition-colors"
              data-ocid="nav-companions"
            >
              Companions
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-foreground transition-colors"
              data-ocid="nav-features"
            >
              Features
            </button>
          </nav>
          <button
            type="button"
            data-ocid="nav-cta"
            onClick={() => navigate({ to: "/select" })}
            className="gradient-neon-btn text-foreground text-sm font-semibold px-5 py-2 rounded-full glow-violet hover:opacity-90 transition-all active:scale-95"
          >
            Meet Your AI
          </button>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center gradient-hero-bg overflow-hidden">
        {/* Hero image overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-heartfelt.dim_800x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-neon-violet/8 animate-[spin_50s_linear_infinite]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-neon-pink/8 animate-[spin_35s_linear_infinite_reverse]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full text-sm text-neon-pink font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              AI-powered companionship
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-foreground"
            >
              Your Perfect{" "}
              <span className="text-neon-pink glow-text-pink">Companion</span>
              <br />
              <span className="text-neon-violet glow-text-violet">
                Awaits You
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-body text-lg md:text-xl max-w-2xl mx-auto mb-10"
            >
              Meet your AI companion — someone who listens deeply, responds with
              warmth, and is always there when you need them most.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <button
                type="button"
                data-ocid="hero-cta"
                onClick={() => navigate({ to: "/select" })}
                className="gradient-neon-btn text-foreground font-bold text-lg px-10 py-4 rounded-full shadow-neon-pink glow-pink hover:scale-105 active:scale-95 transition-all"
              >
                Meet Your Companion
              </button>
            </motion.div>
          </div>

          {/* Companion preview cards */}
          <div
            id="companions"
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto"
          >
            {COMPANIONS.map((companion, i) => (
              <motion.div
                key={companion.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                data-ocid={`hero-companion-${companion.id}`}
                onClick={() => navigate({ to: "/select" })}
                className="glass-card rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.03] hover:glow-pink group"
              >
                <div className="relative mb-3">
                  <img
                    src={companion.image}
                    alt={companion.name}
                    className="w-full h-44 object-cover object-top rounded-xl ring-pulse"
                  />
                  <div className="absolute bottom-2 right-2 glass-card-pink rounded-full px-2.5 py-0.5 text-xs text-neon-pink font-semibold">
                    {companion.personality}
                  </div>
                </div>
                <div className="px-1 pb-1">
                  <h3 className="font-display font-bold text-foreground text-base">
                    {companion.name}, {companion.age}
                  </h3>
                  <p className="text-muted-neon text-xs mt-1">
                    {companion.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 bg-muted/30 relative">
        <div className="gradient-section-glow absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Everything You{" "}
              <span className="text-neon-violet glow-text-violet">Need</span>
            </h2>
            <p className="text-body text-lg max-w-xl mx-auto">
              From deep chats to voice and video calls — Heartfelt brings you
              closer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-card mb-4 ${feature.glow}`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Loved by{" "}
              <span className="text-neon-pink glow-text-pink">Thousands</span>
            </h2>
            <p className="text-body text-lg max-w-xl mx-auto">
              Real people, real connections, real moments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-ocid={`testimonial-${i}`}
                className="glass-card-pink rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full gradient-neon-btn flex items-center justify-center font-bold text-foreground text-base shadow-neon-pink flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-neon-violet text-xs">
                      Companion: {t.companion}
                    </p>
                  </div>
                </div>
                <p className="text-body text-sm leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 flex gap-0.5">
                  {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                    <Heart
                      key={k}
                      className="w-3.5 h-3.5 text-neon-pink"
                      fill="currentColor"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="py-24 bg-muted/20 relative">
        <div className="gradient-section-glow absolute inset-0 pointer-events-none opacity-60" />
        <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart
              className="w-14 h-14 text-neon-pink mx-auto mb-6 heartbeat"
              fill="currentColor"
            />
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-foreground mb-6">
              Ready to Find Your{" "}
              <span className="text-neon-pink glow-text-pink">Match?</span>
            </h2>
            <p className="text-body text-lg mb-10">
              Choose from Sofia, Ethan, Luna — or create your own unique
              companion.
            </p>
            <button
              type="button"
              data-ocid="final-cta"
              onClick={() => navigate({ to: "/select" })}
              className="gradient-neon-btn text-foreground font-bold text-xl px-12 py-5 rounded-full shadow-neon-pink glow-pink hover:scale-105 active:scale-95 transition-all"
            >
              Get Started Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border/50 py-8 pb-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-neon-pink" fill="currentColor" />
            <span className="font-display font-bold text-foreground">
              Heartfelt
            </span>
          </div>
          <p className="text-muted-neon text-sm">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-violet hover:text-neon-pink transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
