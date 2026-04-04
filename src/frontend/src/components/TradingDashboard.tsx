import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CRYPTO_ASSETS, generateOHLC } from "../data/cryptoAssets";
import { useTradingState } from "../hooks/useTradingState";
import { AdminPanel } from "./AdminPanel";
import { CandlestickChart } from "./CandlestickChart";
import { Header } from "./Header";
import { Portfolio } from "./Portfolio";
import { ReferralSystem } from "./ReferralSystem";
import { TopCryptos } from "./TopCryptos";
import { TradePanel } from "./TradePanel";

const TIMEFRAMES = ["1H", "4H", "1D", "1W"];

interface TradingDashboardProps {
  isAdmin: boolean;
  isApproved: boolean;
}

export function TradingDashboard({
  isAdmin,
  isApproved,
}: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [timeframe, setTimeframe] = useState("1H");
  const [showAdmin, setShowAdmin] = useState(false);

  const { portfolio, executeBuy, executeSell } = useTradingState();

  const ohlcData = useMemo(() => {
    const asset = CRYPTO_ASSETS.find((a) => a.symbol === selectedSymbol);
    return generateOHLC(asset?.price ?? 1000, 60);
  }, [selectedSymbol]);

  const selectedAsset = CRYPTO_ASSETS.find((a) => a.symbol === selectedSymbol);

  if (showAdmin && isAdmin) {
    return <AdminPanel onGoToDashboard={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen gradient-dark text-foreground flex flex-col">
      <Header
        isAdmin={isAdmin}
        isApproved={isApproved}
        approvalStatus="Admin Approval Pending"
        onToggleAdmin={() => setShowAdmin(!showAdmin)}
        showingAdmin={showAdmin}
      />

      <main className="flex-1 px-4 lg:px-6 py-5">
        {/* Portfolio strip */}
        <div className="mb-5">
          <Portfolio portfolio={portfolio} />
        </div>

        {/* 3-column grid */}
        <div className="grid lg:grid-cols-[1fr_2fr_1fr] gap-5">
          {/* LEFT column */}
          <div className="space-y-5">
            {/* Welcome card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-coin-surface border border-coin rounded-xl p-5"
            >
              <h2 className="font-display text-xl font-bold mb-2">
                Welcome, <span className="text-coin-mint">Trader!</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Practice with{" "}
                <span className="text-coin-mint font-semibold">$100,000</span>{" "}
                virtual balance. All trades are simulated.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: "oklch(0.13 0.013 240)" }}
                >
                  <div className="text-lg font-bold font-mono text-coin-mint">
                    {portfolio.trades.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Trades</div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: "oklch(0.13 0.013 240)" }}
                >
                  <div className="text-lg font-bold font-mono">
                    {portfolio.holdings.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Holdings</div>
                </div>
              </div>
            </motion.div>

            {/* Holdings */}
            {portfolio.holdings.length > 0 && (
              <div className="bg-coin-surface border border-coin rounded-xl overflow-hidden">
                <div
                  className="px-4 py-3 border-b text-sm font-semibold"
                  style={{ borderColor: "oklch(0.28 0.02 240)" }}
                >
                  My Holdings
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: "oklch(0.22 0.018 240)" }}
                >
                  {portfolio.holdings.map((h) => {
                    const asset = CRYPTO_ASSETS.find(
                      (a) => a.symbol === h.symbol,
                    );
                    const currVal = h.amount * (asset?.price ?? 0);
                    const costBasis = h.amount * h.avgBuyPrice;
                    const pnl = currVal - costBasis;
                    const isPos = pnl >= 0;
                    return (
                      <div key={h.symbol} className="px-4 py-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-semibold">
                              {h.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {h.amount.toFixed(6)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono font-semibold">
                              ${currVal.toFixed(2)}
                            </div>
                            <div
                              className="text-xs font-mono"
                              style={{
                                color: isPos
                                  ? "oklch(0.72 0.18 145)"
                                  : "oklch(0.62 0.22 22)",
                              }}
                            >
                              {isPos ? "+" : ""}${pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CENTER column */}
          <div className="space-y-5">
            {/* Chart card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-coin-surface border border-coin rounded-xl overflow-hidden"
            >
              {/* Chart header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "oklch(0.28 0.02 240)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{selectedSymbol}/USDT</span>
                  <span className="font-mono text-xl font-bold">
                    {selectedAsset && selectedAsset.price >= 1
                      ? `$${selectedAsset.price.toLocaleString()}`
                      : `$${selectedAsset?.price.toFixed(4)}`}
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color:
                        (selectedAsset?.change24h ?? 0) >= 0
                          ? "oklch(0.72 0.18 145)"
                          : "oklch(0.62 0.22 22)",
                    }}
                  >
                    {(selectedAsset?.change24h ?? 0) >= 0 ? (
                      <TrendingUp className="inline h-4 w-4 mr-0.5" />
                    ) : (
                      <TrendingDown className="inline h-4 w-4 mr-0.5" />
                    )}
                    {(selectedAsset?.change24h ?? 0) >= 0 ? "+" : ""}
                    {selectedAsset?.change24h.toFixed(2)}%
                  </span>
                </div>
                <ToggleGroup
                  type="single"
                  value={timeframe}
                  onValueChange={(v) => v && setTimeframe(v)}
                  className="gap-0.5"
                >
                  {TIMEFRAMES.map((tf) => (
                    <ToggleGroupItem
                      key={tf}
                      value={tf}
                      data-ocid="chart.toggle"
                      className="h-7 px-2 text-xs"
                    >
                      {tf}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="p-3">
                <CandlestickChart data={ohlcData} />
              </div>
            </motion.div>

            {/* Trade Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <TradePanel
                selectedSymbol={selectedSymbol}
                portfolio={portfolio}
                onBuy={executeBuy}
                onSell={executeSell}
              />
            </motion.div>
          </div>

          {/* RIGHT column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="space-y-5"
          >
            <ReferralSystem />
            <TopCryptos
              selectedSymbol={selectedSymbol}
              onSelect={setSelectedSymbol}
            />
          </motion.div>
        </div>

        {/* Transaction History */}
        {portfolio.trades.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-coin-surface border border-coin rounded-xl overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-5 py-3 border-b"
              style={{ borderColor: "oklch(0.28 0.02 240)" }}
            >
              <ArrowUpDown className="h-4 w-4 text-coin-mint" />
              <h3 className="font-semibold text-sm">Transaction History</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {portfolio.trades.length} trades
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "oklch(0.22 0.018 240)" }}>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Price</TableHead>
                    <TableHead className="text-xs">Brokerage</TableHead>
                    <TableHead className="text-xs">Tax (STT)</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.trades.slice(0, 20).map((trade, i) => (
                    <TableRow
                      key={trade.id}
                      data-ocid={`history.item.${i + 1}`}
                      style={{ borderColor: "oklch(0.19 0.016 240)" }}
                    >
                      <TableCell>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background:
                              trade.type === "buy"
                                ? "oklch(0.72 0.18 145 / 0.15)"
                                : "oklch(0.62 0.22 22 / 0.15)",
                            color:
                              trade.type === "buy"
                                ? "oklch(0.72 0.18 145)"
                                : "oklch(0.62 0.22 22)",
                          }}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-xs">
                        {trade.symbol}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {trade.amount.toFixed(6)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        ${trade.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-yellow-400">
                        ${trade.brokerage.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-yellow-400">
                        {trade.type === "sell"
                          ? `$${trade.tax.toFixed(4)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold">
                        ${trade.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {trade.timestamp.toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {portfolio.trades.length === 0 && (
          <div
            data-ocid="history.empty_state"
            className="mt-6 bg-coin-surface border border-coin rounded-xl p-10 text-center"
          >
            <ArrowUpDown className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">
              No trades yet. Start trading to see your history here.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-coin py-5 px-6 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold">
            CoinLearn &mdash; Educational Simulator
          </span>
          <span>
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
          </span>
        </div>
      </footer>
    </div>
  );
}
