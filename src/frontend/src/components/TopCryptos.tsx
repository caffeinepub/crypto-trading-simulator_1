import { ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { CRYPTO_ASSETS } from "../data/cryptoAssets";

interface TopCryptosProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export function TopCryptos({ selectedSymbol, onSelect }: TopCryptosProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.28 0.02 240)" }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{
          background: "oklch(0.13 0.013 240)",
          borderColor: "oklch(0.28 0.02 240)",
        }}
      >
        <h3 className="font-semibold text-sm">Top Cryptocurrencies</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click any coin to trade
        </p>
      </div>

      <div
        className="divide-y"
        style={{ borderColor: "oklch(0.22 0.018 240)" }}
      >
        {CRYPTO_ASSETS.map((asset, i) => {
          const isPos = asset.change24h >= 0;
          const isSelected = asset.symbol === selectedSymbol;
          return (
            <button
              key={asset.symbol}
              type="button"
              data-ocid={`crypto.item.${i + 1}`}
              onClick={() => onSelect(asset.symbol)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors text-left"
              style={{
                background: isSelected
                  ? "oklch(0.82 0.18 168 / 0.08)"
                  : undefined,
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: "oklch(0.22 0.02 240)",
                  border: isSelected
                    ? "1px solid oklch(0.82 0.18 168 / 0.5)"
                    : "1px solid oklch(0.28 0.02 240)",
                  color: "oklch(0.82 0.18 168)",
                }}
              >
                {asset.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{asset.symbol}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {asset.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-semibold">
                  {asset.price >= 1
                    ? `$${asset.price.toLocaleString()}`
                    : `$${asset.price.toFixed(4)}`}
                </div>
                <div
                  className="text-xs font-mono flex items-center justify-end gap-0.5"
                  style={{
                    color: isPos
                      ? "oklch(0.72 0.18 145)"
                      : "oklch(0.62 0.22 22)",
                  }}
                >
                  {isPos ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPos ? "+" : ""}
                  {asset.change24h.toFixed(2)}%
                </div>
              </div>
              {/* Trade indicator */}
              {isSelected && (
                <div
                  className="flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: "oklch(0.82 0.18 168 / 0.15)",
                    color: "oklch(0.82 0.18 168)",
                    border: "1px solid oklch(0.82 0.18 168 / 0.3)",
                    fontSize: 9,
                  }}
                >
                  <ShoppingCart className="h-2.5 w-2.5" />
                  TRADE
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="px-4 py-2.5 text-center"
        style={{
          background: "oklch(0.12 0.012 240)",
          borderTop: "1px solid oklch(0.22 0.018 240)",
        }}
      >
        <p className="text-xs text-muted-foreground">
          Select a coin above, then use the{" "}
          <span style={{ color: "oklch(0.82 0.18 168)" }}>Buy / Sell</span>{" "}
          panel in the center
        </p>
      </div>
    </div>
  );
}
