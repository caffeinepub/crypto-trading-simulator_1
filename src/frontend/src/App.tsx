import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { KYCForm } from "./components/KYCForm";
import { Landing } from "./components/Landing";
import { PaymentPage } from "./components/PaymentPage";
import { TradingDashboard } from "./components/TradingDashboard";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useIsApproved } from "./hooks/useQueries";
import type { AppView } from "./types/trading";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: isApproved, isLoading: approvedLoading } = useIsApproved();

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

  // Determine which view to show
  const getView = (): AppView => {
    if (!isAuthenticated) return "landing";
    if (adminLoading || approvedLoading || isInitializing) return "landing"; // will show loading
    if (isAdmin) return "dashboard"; // admins always get dashboard
    if (!isApproved && !kycSubmitted) return "kyc";
    if (!isApproved) return "kyc"; // pending
    if (!hasPaid) return "payment";
    return "dashboard";
  };

  const view = getView();
  const isLoading =
    isAuthenticated && (adminLoading || approvedLoading || isInitializing);

  if (isLoading) {
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
