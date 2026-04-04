import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ApprovalStatus,
  useListApprovals,
  useSetApproval,
} from "../hooks/useQueries";

export function AdminPanel({
  onGoToDashboard,
}: {
  onGoToDashboard: () => void;
}) {
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("all");

  const filtered = useMemo(() => {
    if (!approvals) return [];
    if (filter === "all") return approvals;
    return approvals.filter((a) => a.status === filter);
  }, [approvals, filter]);

  const counts = useMemo(() => {
    const pending =
      approvals?.filter((a) => a.status === ApprovalStatus.pending).length ?? 0;
    const approved =
      approvals?.filter((a) => a.status === ApprovalStatus.approved).length ??
      0;
    const rejected =
      approvals?.filter((a) => a.status === ApprovalStatus.rejected).length ??
      0;
    return { pending, approved, rejected, total: approvals?.length ?? 0 };
  }, [approvals]);

  const handleApprove = async (principal: Principal) => {
    try {
      await setApproval.mutateAsync({
        user: principal,
        status: ApprovalStatus.approved,
      });
      toast.success("User approved successfully");
    } catch {
      toast.error("Failed to approve user");
    }
  };

  const handleReject = async (principal: Principal) => {
    try {
      await setApproval.mutateAsync({
        user: principal,
        status: ApprovalStatus.rejected,
      });
      toast.error("User rejected");
    } catch {
      toast.error("Failed to reject user");
    }
  };

  const filterOptions = [
    "all" as const,
    ApprovalStatus.pending,
    ApprovalStatus.approved,
    ApprovalStatus.rejected,
  ];

  return (
    <div className="min-h-screen gradient-dark text-foreground">
      {/* Header */}
      <header className="border-b border-coin px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-coin-mint" />
            <div>
              <h1 className="font-display text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">
                CoinLearn — User Approval Management
              </p>
            </div>
          </div>
          <Button
            data-ocid="admin.button"
            variant="outline"
            size="sm"
            onClick={onGoToDashboard}
            className="border-coin text-sm"
          >
            My Dashboard <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: counts.total, color: "text-foreground" },
            {
              label: "Pending",
              value: counts.pending,
              color: "text-yellow-400",
            },
            {
              label: "Approved",
              value: counts.approved,
              color: "text-coin-green",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              color: "text-coin-red",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-coin-surface border border-coin rounded-xl p-4 text-center"
            >
              <div className={`text-3xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {filterOptions.map((f) => (
            <button
              key={f}
              type="button"
              data-ocid="admin.tab"
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize"
              style={{
                background:
                  filter === f
                    ? "oklch(0.82 0.18 168 / 0.18)"
                    : "oklch(0.16 0.015 240)",
                color:
                  filter === f
                    ? "oklch(0.82 0.18 168)"
                    : "oklch(0.62 0.025 240)",
                border:
                  filter === f
                    ? "1px solid oklch(0.82 0.18 168 / 0.4)"
                    : "1px solid oklch(0.28 0.02 240)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Users list */}
        {isLoading ? (
          <div data-ocid="admin.loading_state" className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="admin.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((approval, i) => {
              const principal = approval.principal.toString();
              const shortPrincipal = `${principal.slice(0, 12)}...${principal.slice(-6)}`;
              const isPending = approval.status === ApprovalStatus.pending;

              return (
                <motion.div
                  key={principal}
                  data-ocid={`admin.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-coin-surface border border-coin rounded-xl px-5 py-4 flex items-center gap-4"
                >
                  {approval.status === ApprovalStatus.approved && (
                    <CheckCircle2 className="h-5 w-5 text-coin-green flex-shrink-0" />
                  )}
                  {approval.status === ApprovalStatus.rejected && (
                    <XCircle className="h-5 w-5 text-coin-red flex-shrink-0" />
                  )}
                  {approval.status === ApprovalStatus.pending && (
                    <Clock className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold truncate">
                      {shortPrincipal}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Principal ID
                    </div>
                  </div>

                  <Badge
                    style={{
                      background:
                        approval.status === ApprovalStatus.approved
                          ? "oklch(0.72 0.18 145 / 0.15)"
                          : approval.status === ApprovalStatus.rejected
                            ? "oklch(0.62 0.22 22 / 0.15)"
                            : "oklch(0.75 0.16 60 / 0.15)",
                      color:
                        approval.status === ApprovalStatus.approved
                          ? "oklch(0.72 0.18 145)"
                          : approval.status === ApprovalStatus.rejected
                            ? "oklch(0.62 0.22 22)"
                            : "oklch(0.75 0.16 60)",
                      border: "none",
                    }}
                  >
                    {approval.status}
                  </Badge>

                  {isPending && (
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`admin.confirm_button.${i + 1}`}
                        size="sm"
                        onClick={() => handleApprove(approval.principal)}
                        disabled={setApproval.isPending}
                        className="h-8 px-3 text-xs font-bold"
                        style={{
                          background: "oklch(0.72 0.18 145)",
                          color: "oklch(0.12 0.012 240)",
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        data-ocid={`admin.delete_button.${i + 1}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(approval.principal)}
                        disabled={setApproval.isPending}
                        className="h-8 px-3 text-xs font-bold"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
