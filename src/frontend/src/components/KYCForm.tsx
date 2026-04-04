import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRequestApproval } from "../hooks/useQueries";

interface KYCData {
  fullName: string;
  email: string;
  phone: string;
  panAadhaar: string;
  referralCode: string;
}

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Identity", icon: FileText },
  { id: 3, label: "Referral", icon: Users },
];

export function KYCForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<KYCData>({
    fullName: "",
    email: "",
    phone: "",
    panAadhaar: "",
    referralCode: "",
  });

  const requestApproval = useRequestApproval();

  const update = (field: keyof KYCData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const validateStep1 = () => {
    if (!data.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!data.phone.trim() || data.phone.length < 10) {
      toast.error("Valid 10-digit phone required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!data.panAadhaar.trim()) {
      toast.error("PAN or Aadhaar number required");
      return false;
    }
    if (data.panAadhaar.trim().length < 10) {
      toast.error("Enter a valid PAN (10 chars) or Aadhaar (12 chars)");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    try {
      await requestApproval.mutateAsync();
      setSubmitted(true);
      toast.success("KYC submitted! Awaiting admin review.");
      setTimeout(() => onSubmitted(), 2000);
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-coin-surface border border-coin rounded-2xl p-10 max-w-md w-full text-center"
        >
          <CheckCircle2 className="h-16 w-16 text-coin-mint mx-auto mb-6" />
          <h2 className="font-display text-2xl font-bold mb-3">
            KYC Submitted!
          </h2>
          <p className="text-muted-foreground">
            Your application is under review. Admin approval typically takes
            under 24 hours.
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
        className="bg-coin-surface border border-coin rounded-2xl p-8 max-w-lg w-full"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold mb-1">
            KYC Registration
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {step} of 3 — {STEPS[step - 1].label}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className="flex-1">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    s.id <= step
                      ? "oklch(0.82 0.18 168)"
                      : "oklch(0.28 0.02 240)",
                }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  data-ocid="kyc.input"
                  placeholder="Rajesh Kumar"
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rajesh@example.com"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <Label
                  htmlFor="panAadhaar"
                  className="text-sm font-medium mb-1.5 block"
                >
                  PAN Card or Aadhaar Number
                </Label>
                <Input
                  id="panAadhaar"
                  placeholder="ABCDE1234F or 1234 5678 9012"
                  value={data.panAadhaar}
                  onChange={(e) => update("panAadhaar", e.target.value)}
                  className="bg-background border-border font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enter your 10-digit PAN or 12-digit Aadhaar number
                </p>
              </div>
              <div
                className="rounded-lg p-4 text-sm"
                style={{
                  background: "oklch(0.82 0.18 168 / 0.07)",
                  border: "1px solid oklch(0.82 0.18 168 / 0.2)",
                }}
              >
                <p className="text-coin-mint font-semibold mb-1">
                  🔒 Your data is secure
                </p>
                <p className="text-muted-foreground text-xs">
                  KYC information is stored securely on the Internet Computer
                  blockchain and only accessible to authorized admins.
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <Label
                  htmlFor="referral"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Referral Code{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="referral"
                  placeholder="e.g. ABC12345"
                  value={data.referralCode}
                  onChange={(e) => update("referralCode", e.target.value)}
                  className="bg-background border-border font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  If a friend referred you, enter their code here.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-coin p-4 space-y-2">
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Application Summary
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{data.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{data.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{data.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID Type</span>
                  <span className="font-medium font-mono">
                    {data.panAadhaar.length >= 12 ? "Aadhaar" : "PAN"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              data-ocid="kyc.cancel_button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border-border"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              data-ocid="kyc.primary_button"
              className="flex-1 font-bold"
              style={{
                background: "oklch(0.82 0.18 168)",
                color: "oklch(0.12 0.012 240)",
              }}
              onClick={handleNext}
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              data-ocid="kyc.submit_button"
              className="flex-1 font-bold"
              style={{
                background: "oklch(0.82 0.18 168)",
                color: "oklch(0.12 0.012 240)",
              }}
              onClick={handleSubmit}
              disabled={requestApproval.isPending}
            >
              {requestApproval.isPending
                ? "Submitting..."
                : "Submit KYC Application"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
