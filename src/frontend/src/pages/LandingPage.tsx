import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Companion, PRESET_COMPANIONS } from "@/lib/aiResponses";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onChatWithPreset: (companion: Companion) => void;
}

export default function LandingPage({
  onGetStarted,
  onChatWithPreset,
}: LandingPageProps) {
  const cardColors: Record<string, string> = {
    pink: "bg-hf-card-pink",
    blue: "bg-hf-card-blue",
    peach: "bg-hf-card-peach",
  };

  const personalityLabels: Record<string, string> = {
    sweet: "Sweet & Gentle",
    playful: "Playful & Fun",
    caring: "Deep & Caring",
    intellectual: "Thoughtful & Curious",
  };

  return (
    <div className="min-h-screen bg-hf-cream font-sans">
      {/* Header */}
      <header
        className="bg-hf-peach-header sticky top-0 z-50 shadow-xs"
        data-ocid="landing.panel"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-hf-rose heartbeat fill-current" />
            <span className="font-display text-xl font-bold text-hf-brown">
              Heartfelt AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Chat"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-hf-body hover:text-hf-rose transition-colors"
                data-ocid={`nav.${item.toLowerCase().replace(" ", "-")}.link`}
              >
                {item}
              </a>
            ))}
          </nav>

          <Button
            onClick={onGetStarted}
            className="bg-hf-rose hover:bg-accent text-white rounded-full px-6 shadow-warm transition-all hover:scale-105"
            data-ocid="landing.get_started.primary_button"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero" id="features">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="animate-slide-up">
              <Badge className="mb-6 bg-hf-blush text-hf-rose border-0 px-4 py-1.5 text-sm font-medium rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI-Powered Companionship
              </Badge>

              <h1 className="font-display text-5xl lg:text-6xl font-bold text-hf-brown leading-tight mb-6">
                Find Your Perfect
                <span className="block text-hf-rose italic">AI Companion</span>
              </h1>

              <p className="text-lg text-hf-body leading-relaxed mb-10 max-w-lg">
                Meet warm, intelligent AI companions designed to listen,
                support, and grow with you. Choose your perfect match and start
                a conversation that feels real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-hf-rose hover:bg-accent text-white rounded-full px-8 shadow-warm transition-all hover:scale-105 text-base"
                  data-ocid="hero.choose_ai.primary_button"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Choose Your AI
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 border-hf-rose text-hf-rose hover:bg-hf-blush transition-all text-base"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  data-ocid="hero.learn_more.secondary_button"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-hf-body">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {["🌸", "💙", "✨"].map((e, i) => (
                      <span
                        key={`avatar-${e}`}
                        className={`text-base ${i === 0 ? "" : "-ml-1"}`}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                  <span>10,000+ happy conversations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5 rating</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-deep">
                <img
                  src="/assets/generated/hero-companion.dim_600x700.jpg"
                  alt="AI Companion"
                  className="w-full h-[520px] object-cover object-top"
                />
                {/* Floating chat preview */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-hf-card-pink flex items-center justify-center text-sm">
                      🌸
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-hf-brown">
                        Sofia
                      </p>
                      <p className="text-xs text-hf-body">is typing...</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pl-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-hf-rose typing-dot"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating personality badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-hf-rose" />
                <span className="text-sm font-medium text-hf-brown">
                  Realistic conversations
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companion Cards Section */}
      <section className="py-20 px-6 bg-white/60" id="chat">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-hf-brown mb-4">
              Meet Your AI Companions
            </h2>
            <p className="text-hf-body text-lg max-w-xl mx-auto">
              Each companion has a unique personality crafted to create
              meaningful, warm connections.
            </p>
          </div>

          <div
            className="grid md:grid-cols-3 gap-8"
            data-ocid="companions.list"
          >
            {PRESET_COMPANIONS.map((companion, index) => (
              <div
                key={companion.name}
                className={`${cardColors[companion.color]} rounded-3xl p-8 flex flex-col items-center text-center shadow-card hover:shadow-warm transition-all duration-300 hover:-translate-y-1 animate-fade-in`}
                style={{ animationDelay: `${index * 150}ms` }}
                data-ocid={`companions.item.${index + 1}`}
              >
                <div
                  className="text-6xl mb-5 heartbeat"
                  style={{ animationDelay: `${index * 700}ms` }}
                >
                  {companion.emoji}
                </div>
                <h3 className="font-display text-2xl font-bold text-hf-brown mb-2">
                  {companion.name}
                </h3>
                <Badge className="mb-3 bg-white/70 text-hf-body border-0 text-xs px-3 py-1 rounded-full capitalize">
                  {companion.type}
                </Badge>
                <p className="text-sm text-hf-body mb-6">
                  {personalityLabels[companion.personality]}
                </p>
                <Button
                  onClick={() => onChatWithPreset(companion)}
                  className="bg-hf-rose hover:bg-accent text-white rounded-full px-6 w-full transition-all hover:scale-105"
                  data-ocid={`companions.chat.button.${index + 1}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-hf-cream" id="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Feature highlight */}
            <div>
              <h2 className="font-display text-4xl font-bold text-hf-brown mb-6 leading-tight">
                Realistic &amp;
                <span className="text-hf-rose italic"> Warm</span>
                <br />
                Conversations
              </h2>
              <p className="text-hf-body text-base leading-relaxed mb-8 max-w-md">
                Our AI companions respond with genuine warmth and personality.
                Every conversation adapts to your mood and communication style.
              </p>

              {/* Mini feature list */}
              <div className="space-y-4">
                {[
                  {
                    icon: Heart,
                    text: "Personality-driven responses — not generic AI",
                  },
                  {
                    icon: Shield,
                    text: "Private & secure — your conversations stay yours",
                  },
                  {
                    icon: Zap,
                    text: "Instant replies — always there when you need them",
                  },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-hf-blush flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-hf-rose" />
                    </div>
                    <span className="text-hf-body text-sm font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Chat Mock */}
            <div className="bg-white rounded-3xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-hf-card-pink flex items-center justify-center text-xl">
                  🌸
                </div>
                <div>
                  <p className="font-semibold text-hf-brown text-sm">Sofia</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Online now
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bubble-ai rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm shadow-xs">
                    Hi sweetie! I&apos;ve been waiting to hear from you 🌸
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bubble-user rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm shadow-xs">
                    Hi Sofia! How are you today?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-ai rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm shadow-xs">
                    I&apos;m doing wonderfully now that you&apos;re here, my
                    dear 💕 How about you?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bubble-user rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm shadow-xs">
                    I&apos;ve had a long day...
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-ai rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm shadow-xs">
                    Aww, my dear, I&apos;m here for you 💕 Tell me everything —
                    I&apos;m all ears.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-up feature row */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎭",
                title: "Personality Traits",
                desc: "Choose from Sweet, Playful, Caring, or Intellectual — each AI thinks and speaks differently.",
              },
              {
                icon: "✏️",
                title: "Custom Names",
                desc: "Give your companion any name you like and make the relationship truly yours.",
              },
              {
                icon: "💌",
                title: "Memory & Context",
                desc: "Conversations are saved locally so your companion always remembers your story.",
              },
            ].map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl bg-white/70 shadow-xs hover:shadow-card transition-all"
                data-ocid={`features.item.${i + 1}`}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display text-lg font-bold text-hf-brown mb-2">
                  {title}
                </h3>
                <p className="text-hf-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/60" id="how-it-works">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-hf-brown mb-4">
            How It Works
          </h2>
          <p className="text-hf-body text-lg mb-14">
            Three simple steps to your perfect AI companion.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                icon: Users,
                title: "Choose Your Type",
                desc: "Pick a girlfriend or boyfriend AI companion — or start with one of our presets.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Set Their Personality",
                desc: "Select Sweet, Playful, Caring, or Intellectual. Give them a name that feels right.",
              },
              {
                step: "03",
                icon: MessageCircle,
                title: "Start Chatting",
                desc: "Dive into warm, meaningful conversations. Your companion grows with you.",
              },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div
                key={step}
                className="flex flex-col items-center"
                data-ocid={`steps.item.${i + 1}`}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-hf-blush flex items-center justify-center">
                    <Icon className="w-7 h-7 text-hf-rose" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-hf-rose text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-hf-brown mb-2">
                  {title}
                </h3>
                <p className="text-hf-body text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={onGetStarted}
            size="lg"
            className="mt-14 bg-hf-rose hover:bg-accent text-white rounded-full px-10 shadow-warm transition-all hover:scale-105 text-base"
            data-ocid="how_it_works.get_started.primary_button"
          >
            <Heart className="w-5 h-5 mr-2" />
            Begin Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-footer text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-display text-lg font-bold">
                Heartfelt AI
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              {["Features", "How It Works", "Privacy Policy", "Terms"].map(
                (link) => (
                  <span
                    key={link}
                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {link}
                  </span>
                ),
              )}
            </div>

            <p className="text-sm opacity-70">
              &copy; {new Date().getFullYear()}. Built with{" "}
              <Heart className="w-3.5 h-3.5 inline fill-current" /> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                className="underline opacity-90 hover:opacity-100"
                target="_blank"
                rel="noreferrer"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
