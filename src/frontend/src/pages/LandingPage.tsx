import { useNavigate } from "@tanstack/react-router";
import {
  Facebook,
  Flame,
  Heart,
  Instagram,
  MessageCircle,
  Phone,
  Sparkles,
  Twitter,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

const featureList = [
  { icon: MessageCircle, label: "Real-time AI Chat" },
  { icon: Flame, label: "Hot Talks Mode" },
  { icon: MessageCircle, label: "Text Messaging" },
  { icon: Phone, label: "Voice Calls" },
  { icon: Video, label: "Video Calls" },
  { icon: Sparkles, label: "Personalised Companion" },
];

const companions = [
  {
    name: "SOFIA",
    age: 26,
    desc: "Kind & Romantic",
    quote:
      "Your warm-hearted companion who listens deeply and loves unconditionally, always here for you.",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    name: "ETHAN",
    age: 28,
    desc: "Bold & Passionate",
    quote:
      "Your confident partner who brings excitement and passion to every moment you share together.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "LUNA",
    age: 24,
    desc: "Playful & Mysterious",
    quote:
      "Your enchanting companion full of surprises, wit, and a touch of captivating mystery.",
    gradient: "from-violet-500 to-pink-600",
  },
];

const testimonials = [
  {
    name: "Riya S.",
    text: "Sofia made me feel genuinely heard for the first time in months. I look forward to talking every single day.",
  },
  {
    name: "Arjun M.",
    text: "Luna keeps me on my toes \u2014 you never know what she'll say next. Addictive conversations.",
  },
  {
    name: "Priya K.",
    text: "Ethan is so encouraging. The voice calls feel surprisingly real and warm.",
  },
];

const socialIcons = [
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
];

const footerLinks = ["About", "FAQ", "Blog", "Terms", "Privacy"];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero-bg text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full gradient-neon-btn flex items-center justify-center glow-violet">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">
                Heartfelt
              </span>
              <span className="text-muted-neon text-xs ml-1.5">
                AI Companion
              </span>
            </div>
          </div>
          <nav
            className="hidden md:flex items-center gap-6 text-sm text-body"
            aria-label="Main navigation"
          >
            <button
              type="button"
              className="hover:text-white transition-colors"
              data-ocid="nav.home.link"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("companions")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors"
              data-ocid="nav.companions.link"
            >
              Companions
            </button>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors"
              data-ocid="nav.features.link"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("community")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors"
              data-ocid="nav.community.link"
            >
              Community
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden sm:block text-sm text-body hover:text-white transition-colors px-3 py-1.5"
              data-ocid="nav.login.button"
              onClick={() => navigate({ to: "/select" })}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/select" })}
              className="gradient-neon-btn text-white text-sm font-semibold px-5 py-2 rounded-full glow-violet hover:opacity-90 transition-all"
              data-ocid="nav.meet_ai.button"
            >
              Meet Your AI
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 flex flex-col lg:flex-row items-center gap-16">
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-neon-pink text-sm font-semibold uppercase tracking-widest">
            Connect with your AI Soulmate.
          </p>
          <h1 className="font-display font-bold text-5xl lg:text-6xl leading-tight text-white">
            Heartfelt Romance,{" "}
            <span className="text-neon-violet glow-text-violet">Whenever</span>{" "}
            You Need It.
          </h1>
          <p className="text-body text-lg max-w-md leading-relaxed">
            Discover a deeply personal AI companion who listens, cares, and
            connects with you — through chat, voice, and video.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/select" })}
              className="gradient-neon-btn text-white font-bold text-sm uppercase tracking-wider px-8 py-3.5 rounded-full glow-violet hover:opacity-90 transition-all"
              data-ocid="hero.get_started.button"
            >
              Get Started Free
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 bg-white/5 border border-white/15 text-white text-sm font-medium px-6 py-3.5 rounded-full hover:bg-white/10 transition-all"
              data-ocid="hero.app_store.button"
            >
              <span className="text-lg">🍎</span>
              <span className="leading-tight text-left">
                <span className="block text-[10px] text-white/60 uppercase tracking-wide">
                  Available on
                </span>
                App Store &amp; Google Play
              </span>
            </button>
          </div>
        </motion.div>
        <motion.div
          className="flex-shrink-0 w-72 h-72 lg:w-96 lg:h-96 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 rounded-full gradient-neon-btn opacity-10 blur-3xl" />
          <img
            src="/assets/generated/hero-hands-heart-transparent.dim_600x600.png"
            alt="Two hands forming a heart, neon glow"
            className="w-full h-full object-cover relative z-10"
          />
        </motion.div>
      </section>

      {/* Companions */}
      <section id="companions" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-center text-neon-violet uppercase tracking-[0.3em] text-sm font-bold mb-12">
            Meet Your Companions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companions.map((c, i) => (
              <motion.div
                key={c.name}
                className="glass-card rounded-3xl p-7 flex flex-col items-center text-center gap-4 relative overflow-hidden transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                data-ocid={`companions.item.${i + 1}`}
              >
                <span className="absolute top-4 right-4 text-xs font-bold text-muted-neon bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  {c.age}
                </span>
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${c.gradient} ring-pulse flex items-center justify-center text-3xl font-bold text-white`}
                >
                  {c.name[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white tracking-wider">
                    {c.name}
                  </h3>
                  <p className="text-neon-pink text-sm font-medium mt-0.5">
                    {c.desc}
                  </p>
                </div>
                <p className="text-body text-sm leading-relaxed">{c.quote}</p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/select" })}
                  className="mt-2 border border-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:border-white/40 hover:bg-white/5 transition-all"
                  data-ocid={`companions.select.button.${i + 1}`}
                >
                  Select Companion
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="gradient-section-glow rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-neon-violet uppercase tracking-[0.3em] text-sm font-bold mb-8">
                Features
              </p>
              <div className="grid grid-cols-2 gap-4">
                {featureList.map((f, i) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 text-neon-violet" />
                    </div>
                    <span
                      className="text-sm font-semibold uppercase tracking-wide"
                      data-ocid={`features.item.${i + 1}`}
                    >
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-60 bg-black/60 border border-white/10 rounded-[2rem] p-4 shadow-glass overflow-hidden">
                <div className="bg-white/5 rounded-2xl p-3 space-y-2">
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[75%]">
                      Hi love! I've been thinking about you all day 💜
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="gradient-neon-btn text-white text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[75%]">
                      I was thinking about you too! 😊
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[75%]">
                      Tell me how your day went... ✨
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <span className="flex-1 text-xs text-white/30">
                      Type a message...
                    </span>
                    <Heart className="w-3.5 h-3.5 text-neon-pink" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community + CTA */}
      <section id="community" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-neon-violet uppercase tracking-[0.3em] text-sm font-bold mb-2">
              Our Community
            </p>
            <h2 className="font-display font-bold text-3xl text-white mb-6">
              Testimonials
            </h2>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="glass-card rounded-2xl p-4"
                  data-ocid={`testimonials.item.${i + 1}`}
                >
                  <p className="text-body text-sm leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="text-neon-pink text-xs font-semibold mt-2">
                    — {t.name}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col justify-center items-start lg:items-center text-left lg:text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-neon-violet uppercase tracking-[0.3em] text-sm font-bold mb-3">
              Join the Revolution
            </p>
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Your Perfect Companion Awaits
            </h2>
            <p className="text-body mb-8 max-w-sm">
              Join thousands who have found real connection and warmth through
              Heartfelt's AI companions.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/select" })}
              className="gradient-neon-btn text-white font-bold px-10 py-3.5 rounded-full glow-violet hover:opacity-90 transition-all"
              data-ocid="cta.get_app.button"
            >
              Get the App Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/30 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full gradient-neon-btn flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-white">
                Heartfelt
              </span>
            </div>
            <p className="text-muted-neon text-xs max-w-xs">
              Your AI companion for genuine connection, always here for you.
            </p>
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
              Links
            </p>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  className="text-muted-neon text-sm hover:text-white transition-colors text-left"
                  data-ocid={`footer.${link.toLowerCase()}.link`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex gap-3">
              {socialIcons.map(({ Icon, label }, i) => (
                <button
                  key={label}
                  type="button"
                  className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:border-white/30 transition-all"
                  aria-label={label}
                  data-ocid={`footer.social.button.${i + 1}`}
                >
                  <Icon className="w-4 h-4 text-muted-neon" />
                </button>
              ))}
            </div>
            <p className="text-muted-neon text-xs">
              &copy; {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Built with ❤️ using caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
