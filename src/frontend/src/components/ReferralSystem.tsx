import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Copy, Link2, Users } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const MOCK_REFERRALS = [
  { name: "Priya S.", status: "Active", joined: "2 days ago", progress: 100 },
  { name: "Arjun M.", status: "Pending", joined: "1 day ago", progress: 60 },
  { name: "Kavya R.", status: "KYC Done", joined: "5 hours ago", progress: 80 },
];

export function ReferralSystem() {
  const { identity } = useInternetIdentity();

  const referralCode = useMemo(() => {
    if (!identity) return "COIN0000";
    const principal = identity.getPrincipal().toString();
    return principal.slice(0, 8).toUpperCase();
  }, [identity]);

  const referralLink = `https://coinlearn.app/ref/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.28 0.02 240)" }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{
          background: "oklch(0.13 0.013 240)",
          borderColor: "oklch(0.28 0.02 240)",
        }}
      >
        <Users className="h-4 w-4 text-coin-mint" />
        <h3 className="font-semibold text-sm">Referral System</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Referral code display */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Your Code</div>
          <div
            className="rounded-lg px-3 py-2 font-mono text-sm font-bold text-coin-mint"
            style={{ background: "oklch(0.13 0.013 240)" }}
          >
            {referralCode}
          </div>
        </div>

        {/* Referral link */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">
            Referral Link
          </div>
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: "oklch(0.13 0.013 240)",
              border: "1px solid oklch(0.28 0.02 240)",
            }}
          >
            <Link2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate flex-1">
              {referralLink}
            </span>
            <Button
              data-ocid="referral.button"
              size="sm"
              variant="ghost"
              onClick={copyLink}
              className="h-6 px-2 text-xs"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: "oklch(0.13 0.013 240)" }}
          >
            <div className="text-lg font-bold text-coin-mint">3</div>
            <div className="text-xs text-muted-foreground">Invited</div>
          </div>
          <div
            className="rounded-lg p-2.5 text-center"
            style={{ background: "oklch(0.13 0.013 240)" }}
          >
            <div className="text-lg font-bold text-coin-green">1</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>

        {/* Referred users */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">
            INVITED USERS
          </div>
          {MOCK_REFERRALS.map((r, i) => (
            <div key={r.name} data-ocid={`referral.item.${i + 1}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">{r.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      r.status === "Active"
                        ? "oklch(0.72 0.18 145 / 0.15)"
                        : "oklch(0.82 0.18 168 / 0.1)",
                    color:
                      r.status === "Active"
                        ? "oklch(0.72 0.18 145)"
                        : "oklch(0.82 0.18 168)",
                  }}
                >
                  {r.status}
                </span>
              </div>
              <Progress
                value={r.progress}
                className="h-1"
                style={{
                  background: "oklch(0.22 0.02 240)",
                }}
              />
              <div className="text-xs text-muted-foreground mt-0.5">
                Joined {r.joined}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
