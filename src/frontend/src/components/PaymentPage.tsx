import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Copy, QrCode, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const HOW_TO_PAY = [
  "Open any UPI app (GPay, PhonePe, Paytm)",
  "Scan the QR code or use the UPI ID below",
  "Enter amount ₹5 and complete payment",
  "Copy the UTR / Transaction ID from your app",
  "Paste it in the field below and confirm",
];

export function PaymentPage({ onPaid }: { onPaid: () => void }) {
  const [utr, setUtr] = useState("");
  const [paid, setPaid] = useState(false);

  const handleSubmit = () => {
    if (!utr.trim() || utr.trim().length < 6) {
      toast.error("Please enter a valid UTR / Transaction ID (min 6 chars)");
      return;
    }
    setPaid(true);
    toast.success("Payment confirmed! Redirecting to dashboard...");
    setTimeout(() => onPaid(), 2000);
  };

  if (paid) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-coin-surface border border-coin rounded-2xl p-10 max-w-md w-full text-center"
        >
          <CheckCircle2 className="h-16 w-16 text-coin-mint mx-auto mb-6" />
          <h2 className="font-display text-2xl font-bold mb-3">
            Payment Received!
          </h2>
          <p className="text-muted-foreground">
            Taking you to the trading dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Join Fee Payment
          </h1>
          <p className="text-muted-foreground">
            One-time{" "}
            <span className="text-coin-mint font-semibold">₹5 Joining Fee</span>{" "}
            to access the simulator
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: instructions */}
          <div className="bg-coin-surface border border-coin rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-coin-mint" />
                How to Pay
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                {HOW_TO_PAY.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "oklch(0.82 0.18 168 / 0.18)",
                        color: "oklch(0.82 0.18 168)",
                      }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div
              className="rounded-lg p-3"
              style={{
                background: "oklch(0.13 0.013 240)",
                border: "1px solid oklch(0.28 0.02 240)",
              }}
            >
              <div className="text-xs text-muted-foreground mb-1">UPI ID</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-coin-mint font-semibold">
                  rayinfotechoffice-1@oksbi
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("rayinfotechoffice-1@oksbi");
                    toast.success("UPI ID copied!");
                  }}
                  className="text-muted-foreground hover:text-coin-mint transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="utr" className="text-sm font-medium">
                UTR / Transaction ID
              </Label>
              <Input
                id="utr"
                data-ocid="payment.input"
                placeholder="Enter your UTR number after paying"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="bg-background border-border font-mono"
              />
              <Button
                data-ocid="payment.submit_button"
                onClick={handleSubmit}
                className="w-full font-bold py-5"
                style={{
                  background: "oklch(0.82 0.18 168)",
                  color: "oklch(0.12 0.012 240)",
                }}
              >
                Confirm Payment
              </Button>
            </div>
          </div>

          {/* Right: QR */}
          <div className="bg-coin-surface border border-coin rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
              <QrCode className="h-4 w-4 text-coin-mint" />
              Scan to Pay
            </div>
            <div className="rounded-xl overflow-hidden bg-white p-3 mb-4">
              <img
                src="/assets/generated/upi-qr-code-transparent.dim_400x450.png"
                alt="UPI QR Code — rayinfotechoffice-1@oksbi"
                className="w-48 h-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Scan using GPay, PhonePe, or Paytm
            </p>
            <div
              className="mt-4 rounded-lg px-4 py-2 text-center"
              style={{
                background: "oklch(0.82 0.18 168 / 0.1)",
                border: "1px solid oklch(0.82 0.18 168 / 0.3)",
              }}
            >
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="text-2xl font-bold text-coin-mint">₹5</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
