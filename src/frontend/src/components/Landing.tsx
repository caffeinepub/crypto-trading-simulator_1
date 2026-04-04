import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const STEPS = [
  { num: 1, label: "Create Account", desc: "Sign in with Internet Identity" },
  { num: 2, label: "Complete KYC", desc: "Verify your identity" },
  { num: 3, label: "Admin Review", desc: "Approval within 24 hours" },
  { num: 4, label: "Pay ₹5 Fee", desc: "One-time joining fee" },
  { num: 5, label: "Start Trading", desc: "$100,000 virtual balance" },
];

const FEATURES = [
  {
    icon: DollarSign,
    title: "$100,000 Virtual Funds",
    desc: "Practice with real market conditions risk-free",
  },
  {
    icon: BarChart3,
    title: "Live Candlestick Charts",
    desc: "Professional OHLC charting with BTC, ETH & more",
  },
  {
    icon: Shield,
    title: "Real Fee Simulation",
    desc: "0.1% brokerage + 0.025% STT for authentic experience",
  },
  {
    icon: Users,
    title: "Referral Rewards",
    desc: "Invite friends and grow your network",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    desc: "Market orders filled instantly at live prices",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Analytics",
    desc: "Track P&L, holdings, and trade history",
  },
];

const PREVIEW_COINS = [
  { s: "BTC", p: "$43,250", c: "+2.34%", up: true },
  { s: "ETH", p: "$2,285", c: "-1.12%", up: false },
  { s: "SOL", p: "$98.50", c: "+4.21%", up: true },
];

// Deterministic bar data for the preview chart
const PREVIEW_BARS = [
  30, 42, 28, 55, 38, 62, 45, 38, 52, 44, 58, 36, 48, 65, 40, 35, 50, 43, 57,
  32,
];

export function Landing() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen gradient-dark text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6">
        {/* Background watermark */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          aria-hidden="true"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <title>Market chart watermark</title>
            <polyline
              points="0,350 80,320 160,280 240,300 320,220 400,250 480,180 560,200 640,140 720,160 800,100"
              fill="none"
              stroke="oklch(0.82 0.18 168)"
              strokeWidth="2"
            />
            {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800].map(
              (x, i) => (
                <rect
                  key={x}
                  x={x - 12}
                  y={
                    [350, 320, 280, 300, 220, 250, 180, 200, 140, 160, 100][i] -
                    20
                  }
                  width="24"
                  height="20"
                  fill={
                    i % 2 === 0 ? "oklch(0.72 0.18 145)" : "oklch(0.62 0.22 22)"
                  }
                  opacity="0.6"
                />
              ),
            )}
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Badge
                className="mb-6 border px-3 py-1 text-xs font-semibold"
                style={{
                  background: "oklch(0.82 0.18 168 / 0.12)",
                  borderColor: "oklch(0.82 0.18 168 / 0.4)",
                  color: "oklch(0.82 0.18 168)",
                }}
              >
                Professional Crypto Trading Simulator
              </Badge>

              <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Master Crypto Trading,{" "}
                <span className="text-coin-mint">Risk‑Free.</span>
              </h1>

              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Build real trading skills with professional tools, live market
                data simulation, and{" "}
                <span className="text-coin-mint font-semibold">$100,000</span>{" "}
                in virtual funds.
              </p>

              {/* Onboarding Steps */}
              <div className="space-y-3 mb-10">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                    className="flex items-center gap-4 bg-coin-surface rounded-lg px-4 py-3 border border-coin"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "oklch(0.82 0.18 168 / 0.18)",
                        color: "oklch(0.82 0.18 168)",
                        border: "1px solid oklch(0.82 0.18 168 / 0.4)",
                      }}
                    >
                      {step.num}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.desc}
                      </div>
                    </div>
                    {i < 4 && (
                      <CircleDot className="ml-auto h-3 w-3 text-muted-foreground" />
                    )}
                    {i === 4 && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-coin-green" />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Button
                  data-ocid="landing.primary_button"
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="text-base px-8 py-6 rounded-xl font-bold"
                  style={{
                    background: "oklch(0.82 0.18 168)",
                    color: "oklch(0.12 0.012 240)",
                  }}
                >
                  {isLoggingIn ? "Connecting..." : "Get Started — Login"}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  One-time ₹5 joining fee · Secure Internet Identity login
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-coin-surface border border-coin rounded-2xl p-5 glow-mint">
                {/* Mini portfolio card */}
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.82 0.18 168 / 0.15), oklch(0.82 0.18 168 / 0.05))",
                    border: "1px solid oklch(0.82 0.18 168 / 0.25)",
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    Total Portfolio Value
                  </div>
                  <div className="text-3xl font-bold font-mono text-coin-mint">
                    $100,000.00
                  </div>
                  <div className="text-xs text-coin-green mt-1">
                    +$0.00 (0.00%) today
                  </div>
                </div>

                {/* Mini chart */}
                <div
                  className="rounded-lg overflow-hidden mb-4"
                  style={{ height: 120, background: "oklch(0.13 0.013 240)" }}
                  aria-hidden="true"
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 300 120"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <title>Preview chart</title>
                    {PREVIEW_BARS.map((h, i) => (
                      <rect
                        key={`bar-x-${i * 15 + 2}`}
                        x={i * 15 + 2}
                        y={120 - h - 20}
                        width="11"
                        height={h}
                        fill={
                          i % 3 !== 1
                            ? "oklch(0.72 0.18 145 / 0.8)"
                            : "oklch(0.62 0.22 22 / 0.8)"
                        }
                        rx="1"
                      />
                    ))}
                  </svg>
                </div>

                {/* Mini crypto table */}
                <div className="space-y-2">
                  {PREVIEW_COINS.map((coin) => (
                    <div
                      key={coin.s}
                      className="flex justify-between items-center rounded-lg px-3 py-2"
                      style={{ background: "oklch(0.13 0.013 240)" }}
                    >
                      <span className="text-sm font-semibold">{coin.s}</span>
                      <span className="text-sm font-mono">{coin.p}</span>
                      <span
                        className="text-xs font-mono font-bold"
                        style={{
                          color: coin.up
                            ? "oklch(0.72 0.18 145)"
                            : "oklch(0.62 0.22 22)",
                        }}
                      >
                        {coin.c}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-3">
              Everything You Need to Trade Like a Pro
            </h2>
            <p className="text-muted-foreground">
              Professional-grade tools. Zero financial risk.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-coin-surface border border-coin rounded-xl p-5 hover:border-primary transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "oklch(0.82 0.18 168 / 0.12)" }}
                >
                  <f.icon className="h-5 w-5 text-coin-mint" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of traders learning with CoinLearn. One-time ₹5
            joining fee.
          </p>
          <Button
            data-ocid="landing.secondary_button"
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
            className="px-10 py-6 text-base font-bold rounded-xl"
            style={{
              background: "oklch(0.82 0.18 168)",
              color: "oklch(0.12 0.012 240)",
            }}
          >
            {isLoggingIn ? "Connecting..." : "Login & Start Learning"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-coin py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
              style={{
                background: "oklch(0.82 0.18 168 / 0.2)",
                color: "oklch(0.82 0.18 168)",
                border: "1px solid oklch(0.82 0.18 168 / 0.4)",
              }}
            >
              C
            </div>
            <span className="font-semibold text-sm">CoinLearn</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span className="text-coin-mint">&hearts;</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-coin-mint transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
