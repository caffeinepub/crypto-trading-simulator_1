import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import { CRYPTO_ASSETS } from "../data/cryptoAssets";
import type { PortfolioState } from "../types/trading";

const INITIAL_BALANCE = 100000;

export function Portfolio({
  portfolio,
}: {
  portfolio: PortfolioState;
}) {
  const currentValue = useMemo(() => {
    const holdingsVal = portfolio.holdings.reduce((sum, h) => {
      const asset = CRYPTO_ASSETS.find((a) => a.symbol === h.symbol);
      return sum + h.amount * (asset?.price ?? 0);
    }, 0);
    return portfolio.usdBalance + holdingsVal;
  }, [portfolio]);

  const pnl = currentValue - INITIAL_BALANCE;
  const pnlPct = (pnl / INITIAL_BALANCE) * 100;
  const isPositive = pnl >= 0;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.82 0.18 168 / 0.12), oklch(0.82 0.18 168 / 0.04))",
        border: "1px solid oklch(0.82 0.18 168 / 0.25)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-coin-mint" />
          <span className="text-sm font-semibold text-muted-foreground">
            Total Portfolio Value
          </span>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: isPositive
              ? "oklch(0.72 0.18 145 / 0.15)"
              : "oklch(0.62 0.22 22 / 0.15)",
            color: isPositive ? "oklch(0.72 0.18 145)" : "oklch(0.62 0.22 22)",
          }}
        >
          {isPositive ? "+" : ""}
          {pnlPct.toFixed(2)}%
        </span>
      </div>

      <div className="text-4xl font-bold font-mono text-coin-mint mb-1">
        $
        {currentValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        {isPositive ? (
          <TrendingUp
            className="h-4 w-4"
            style={{ color: "oklch(0.72 0.18 145)" }}
          />
        ) : (
          <TrendingDown
            className="h-4 w-4"
            style={{ color: "oklch(0.62 0.22 22)" }}
          />
        )}
        <span
          style={{
            color: isPositive ? "oklch(0.72 0.18 145)" : "oklch(0.62 0.22 22)",
          }}
        >
          {isPositive ? "+" : ""}$
          {Math.abs(pnl).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          all time
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div
          className="rounded-lg p-3"
          style={{ background: "oklch(0.13 0.013 240)" }}
        >
          <div className="text-xs text-muted-foreground mb-1">Cash Balance</div>
          <div className="font-mono font-semibold text-sm">
            $
            {portfolio.usdBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: "oklch(0.13 0.013 240)" }}
        >
          <div className="text-xs text-muted-foreground mb-1">Holdings</div>
          <div className="font-mono font-semibold text-sm">
            {portfolio.holdings.length} assets
          </div>
        </div>
      </div>
    </div>
  );
}
