import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KYCForm } from "./components/KYCForm";
import { Landing } from "./components/Landing";
import { PaymentPage } from "./components/PaymentPage";
import { TradingDashboard } from "./components/TradingDashboard";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useClaimAdmin,
  useHasAnyAdmin,
  useIsAdmin,
  useIsApproved,
} from "./hooks/useQueries";
import type { AppView } from "./types/trading";

function ClaimAdminScreen() {
  const claimAdmin = useClaimAdmin();

  const handleClaim = async () => {
    try {
      const success = await claimAdmin.mutateAsync();
      if (success) {
        toast.success("Admin access claimed successfully! Redirecting...");
      } else {
        toast.error(
          "Failed to claim admin — someone else may have already claimed it.",
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center space-y-6"
        style={{
          background: "oklch(0.16 0.016 240)",
          border: "1px solid oklch(0.28 0.02 240)",
          boxShadow: "0 0 40px oklch(0.82 0.18 168 / 0.08)",
        }}
        data-ocid="claim_admin.panel"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.18 168 / 0.12)",
              border: "1.5px solid oklch(0.82 0.18 168 / 0.4)",
            }}
          >
            <ShieldCheck
              className="w-10 h-10"
              style={{ color: "oklch(0.82 0.18 168)" }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "oklch(0.95 0.01 240)" }}
          >
            Admin Setup
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.65 0.02 240)" }}
          >
            No admin has been assigned yet. As the first authenticated user, you
            can claim admin rights to manage the CoinLearn platform.
          </p>
        </div>

        {/* Info box */}
        <div
          className="rounded-xl p-4 text-left space-y-2"
          style={{
            background: "oklch(0.82 0.18 168 / 0.06)",
            border: "1px solid oklch(0.82 0.18 168 / 0.2)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "oklch(0.82 0.18 168)" }}
          >
            First-Time Setup
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.7 0.02 240)" }}
          >
            This action can only be performed once — before any admin exists.
            After claiming, you will have full access to the admin panel to
            approve users and manage the platform.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleClaim}
          disabled={claimAdmin.isPending}
          className="w-full h-11 font-semibold text-sm"
          style={{
            background: claimAdmin.isPending
              ? "oklch(0.82 0.18 168 / 0.4)"
              : "oklch(0.82 0.18 168)",
            color: "oklch(0.12 0.01 240)",
            border: "none",
          }}
          data-ocid="claim_admin.primary_button"
        >
          {claimAdmin.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming Admin Access...
            </>
          ) : (
            "Claim Admin Access"
          )}
        </Button>

        {claimAdmin.isPending && (
          <p
            className="text-xs"
            style={{ color: "oklch(0.65 0.02 240)" }}
            data-ocid="claim_admin.loading_state"
          >
            Processing on the Internet Computer...
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
  } = useIsAdmin();
  const {
    data: isApproved,
    isLoading: approvedLoading,
    isFetched: approvedFetched,
  } = useIsApproved();
  const {
    data: hasAnyAdmin,
    isLoading: hasAnyAdminLoading,
    isFetched: hasAnyAdminFetched,
  } = useHasAnyAdmin();

  // Payment status stored in localStorage keyed by principal
  const principalKey = identity?.getPrincipal().toString() ?? "";
  const [hasPaid, setHasPaid] = useState(() => {
    if (!principalKey) return false;
    return localStorage.getItem(`coinlearn_paid_${principalKey}`) === "true";
  });

  // KYC submitted state (before backend responds with "pending")
  const [kycSubmitted, setKycSubmitted] = useState(false);

  // Sync hasPaid when identity changes
  useEffect(() => {
    if (principalKey) {
      setHasPaid(
        localStorage.getItem(`coinlearn_paid_${principalKey}`) === "true",
      );
    }
  }, [principalKey]);

  const handlePaid = () => {
    if (principalKey) {
      localStorage.setItem(`coinlearn_paid_${principalKey}`, "true");
    }
    setHasPaid(true);
  };

  // Show landing page if not authenticated at all (don't wait for queries)
  if (!isAuthenticated && !isInitializing) {
    return (
      <>
        <Landing />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "oklch(0.19 0.016 240)",
              border: "1px solid oklch(0.28 0.02 240)",
              color: "oklch(0.95 0.01 240)",
            },
          }}
        />
      </>
    );
  }

  // True while any query is still loading (after auth)
  const isLoading =
    isInitializing ||
    (isAuthenticated &&
      (adminLoading || approvedLoading || hasAnyAdminLoading));

  // Wait until all queries have been fetched at least once before routing
  const allReady =
    isAuthenticated &&
    !isInitializing &&
    adminFetched &&
    approvedFetched &&
    hasAnyAdminFetched;

  // Determine which view to show
  const getView = (): AppView => {
    if (!isAuthenticated) return "landing";

    // Show loading spinner until all queries have resolved
    if (!allReady) return "loading" as AppView;

    // First-time setup: no admin exists yet → let first user claim admin
    if (hasAnyAdmin === false) return "claim-admin";

    // Admin: always goes straight to dashboard
    if (isAdmin === true) return "dashboard";

    // Regular user: must complete KYC first (request approval from backend)
    if (!isApproved && !kycSubmitted) return "kyc";

    // KYC pending (submitted but not yet approved)
    if (!isApproved) return "kyc";

    // Approved but hasn't paid joining fee
    if (!hasPaid) return "payment";

    return "dashboard";
  };

  const view = getView();

  if (isLoading || view === ("loading" as AppView)) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto"
            style={{
              background: "oklch(0.82 0.18 168 / 0.2)",
              color: "oklch(0.82 0.18 168)",
              border: "1.5px solid oklch(0.82 0.18 168 / 0.5)",
            }}
          >
            C
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-48 mx-auto" />
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Loading CoinLearn...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === "landing" && <Landing />}

      {view === "claim-admin" && <ClaimAdminScreen />}

      {view === "kyc" && <KYCForm onSubmitted={() => setKycSubmitted(true)} />}

      {view === "payment" && <PaymentPage onPaid={handlePaid} />}

      {view === "dashboard" && (
        <TradingDashboard
          isAdmin={isAdmin ?? false}
          isApproved={isApproved ?? false}
        />
      )}

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.19 0.016 240)",
            border: "1px solid oklch(0.28 0.02 240)",
            color: "oklch(0.95 0.01 240)",
          },
        }}
      />
    </>
  );
}
