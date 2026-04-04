import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  BookOpen,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Shield,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { CRYPTO_ASSETS } from "../data/cryptoAssets";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Academy", icon: BookOpen },
  { label: "Market", icon: BarChart2 },
  { label: "Leaderboard", icon: Trophy },
  { label: "Community", icon: Users },
  { label: "Referral", icon: GitBranch },
];

interface HeaderProps {
  isAdmin: boolean;
  isApproved: boolean;
  approvalStatus: string;
  onToggleAdmin: () => void;
  showingAdmin: boolean;
  onNavSelect?: (label: string) => void;
  activeNav?: string;
}

export function Header({
  isAdmin,
  isApproved,
  approvalStatus,
  onToggleAdmin,
  showingAdmin,
  onNavSelect,
  activeNav = "Dashboard",
}: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const tickerRef = useRef<HTMLDivElement>(null);

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const principalShort = principalStr ? `${principalStr.slice(0, 8)}...` : "";

  return (
    <header className="sticky top-0 z-50">
      {/* Main nav */}
      <div
        className="px-4 lg:px-6 py-3 flex items-center gap-4"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.10 0.012 240), oklch(0.12 0.016 220))",
          borderBottom: "1px solid oklch(0.28 0.02 240)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: "oklch(0.82 0.18 168 / 0.2)",
              color: "oklch(0.82 0.18 168)",
              border: "1.5px solid oklch(0.82 0.18 168 / 0.5)",
            }}
          >
            C
          </div>
          <span className="font-display font-bold text-base hidden sm:block">
            CoinLearn
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden xl:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              data-ocid="header.link"
              onClick={() => onNavSelect?.(link.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                color:
                  activeNav === link.label
                    ? "oklch(0.82 0.18 168)"
                    : "oklch(0.62 0.025 240)",
                background:
                  activeNav === link.label
                    ? "oklch(0.82 0.18 168 / 0.1)"
                    : "transparent",
              }}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          {/* User chip */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: "oklch(0.16 0.015 240)",
              border: "1px solid oklch(0.28 0.02 240)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "oklch(0.82 0.18 168 / 0.25)",
                color: "oklch(0.82 0.18 168)",
              }}
            >
              {principalShort.slice(0, 1).toUpperCase()}
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {principalShort}
            </span>
            <Badge
              className="text-xs px-1.5 py-0 h-4"
              style={{
                background: isApproved
                  ? "oklch(0.72 0.18 145 / 0.15)"
                  : "oklch(0.75 0.16 60 / 0.15)",
                color: isApproved
                  ? "oklch(0.72 0.18 145)"
                  : "oklch(0.75 0.16 60)",
                border: "none",
                fontSize: "10px",
              }}
            >
              {isApproved ? "Approved" : approvalStatus}
            </Badge>
          </div>

          {/* Admin toggle */}
          {isAdmin && (
            <Button
              data-ocid="header.toggle"
              size="sm"
              variant="outline"
              onClick={onToggleAdmin}
              className="h-8 px-3 text-xs border-coin"
            >
              <Shield className="h-3.5 w-3.5 mr-1 text-coin-mint" />
              {showingAdmin ? "Exit Admin" : "Admin"}
            </Button>
          )}

          {/* Referral button - always visible */}
          <Button
            data-ocid="header.referral_button"
            size="sm"
            variant="outline"
            onClick={() => onNavSelect?.("Referral")}
            className="h-8 px-3 text-xs border-coin"
            style={{
              borderColor:
                activeNav === "Referral"
                  ? "oklch(0.82 0.18 168 / 0.5)"
                  : undefined,
              color:
                activeNav === "Referral" ? "oklch(0.82 0.18 168)" : undefined,
            }}
          >
            <GitBranch className="h-3.5 w-3.5 mr-1" />
            Referral
          </Button>

          {/* Trade Now */}
          <Button
            data-ocid="header.primary_button"
            size="sm"
            className="h-8 px-4 text-xs font-bold"
            style={{
              background: "oklch(0.82 0.18 168)",
              color: "oklch(0.12 0.012 240)",
            }}
            onClick={() => onNavSelect?.("Dashboard")}
          >
            Trade Now
          </Button>

          {/* Logout */}
          <Button
            data-ocid="header.secondary_button"
            size="sm"
            variant="ghost"
            onClick={clear}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Ticker bar */}
      <div
        className="overflow-hidden py-1.5"
        ref={tickerRef}
        style={{
          background: "oklch(0.10 0.01 240)",
          borderBottom: "1px solid oklch(0.22 0.018 240)",
        }}
      >
        <div
          className="ticker-scroll flex gap-8 whitespace-nowrap"
          style={{ width: "200%" }}
        >
          {[...CRYPTO_ASSETS, ...CRYPTO_ASSETS].map((asset, i) => {
            const isPos = asset.change24h >= 0;
            return (
              <div
                key={`ticker-${asset.symbol}-${i}`}
                className="inline-flex items-center gap-2 text-xs"
              >
                <span className="font-semibold text-foreground">
                  {asset.symbol}/USDT
                </span>
                <span className="font-mono">
                  {asset.price >= 1
                    ? `$${asset.price.toLocaleString()}`
                    : `$${asset.price.toFixed(4)}`}
                </span>
                <span
                  className="font-mono"
                  style={{
                    color: isPos
                      ? "oklch(0.72 0.18 145)"
                      : "oklch(0.62 0.22 22)",
                  }}
                >
                  {isPos ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
