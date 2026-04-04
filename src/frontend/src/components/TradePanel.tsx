import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { CRYPTO_ASSETS } from "../data/cryptoAssets";
import type { PortfolioState } from "../types/trading";

interface TradePanelProps {
  selectedSymbol: string;
  portfolio: PortfolioState;
  onBuy: (
    symbol: string,
    usdAmount: number,
  ) => { success: boolean; error?: string };
  onSell: (
    symbol: string,
    coinAmount: number,
  ) => { success: boolean; error?: string };
}

const QUICK_BUY_AMOUNTS = [100, 500, 1000, 5000];
const QUICK_SELL_PCTS = [25, 50, 75, 100];

export function TradePanel({
  selectedSymbol,
  portfolio,
  onBuy,
  onSell,
}: TradePanelProps) {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  const asset = CRYPTO_ASSETS.find((a) => a.symbol === selectedSymbol);
  const price = asset?.price ?? 0;

  const buyUsd = Number.parseFloat(buyAmount) || 0;
  const buyBrokerage = buyUsd * 0.001;
  const buyTotal = buyUsd + buyBrokerage;
  const buyCoins = price > 0 ? buyUsd / price : 0;

  const sellCoins = Number.parseFloat(sellAmount) || 0;
  const sellGross = sellCoins * price;
  const sellBrokerage = sellGross * 0.001;
  const sellSTT = sellGross * 0.00025;
  const sellNet = sellGross - sellBrokerage - sellSTT;

  const holding = portfolio.holdings.find((h) => h.symbol === selectedSymbol);

  const handleBuy = () => {
    if (buyUsd <= 0) {
      toast.error("Enter a valid USD amount");
      return;
    }
    const result = onBuy(selectedSymbol, buyUsd);
    if (result.success) {
      toast.success(`Bought ${buyCoins.toFixed(6)} ${selectedSymbol}`);
      setBuyAmount("");
    } else {
      toast.error(result.error ?? "Trade failed");
    }
  };

  const handleSell = () => {
    if (sellCoins <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const result = onSell(selectedSymbol, sellCoins);
    if (result.success) {
      toast.success(
        `Sold ${sellCoins} ${selectedSymbol} for $${sellNet.toFixed(2)}`,
      );
      setSellAmount("");
    } else {
      toast.error(result.error ?? "Trade failed");
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid oklch(0.28 0.02 240)" }}
    >
      <Tabs defaultValue="buy">
        <TabsList
          className="w-full rounded-none h-11"
          style={{ background: "oklch(0.13 0.013 240)" }}
        >
          <TabsTrigger
            data-ocid="trade.tab"
            value="buy"
            className="flex-1 data-[state=active]:text-[oklch(0.72_0.18_145)] data-[state=active]:font-bold"
          >
            BUY
          </TabsTrigger>
          <TabsTrigger
            data-ocid="trade.tab"
            value="sell"
            className="flex-1 data-[state=active]:text-[oklch(0.62_0.22_22)] data-[state=active]:font-bold"
          >
            SELL
          </TabsTrigger>
        </TabsList>

        {/* BUY */}
        <TabsContent value="buy" className="p-4 space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Available</span>
            <span className="font-mono">
              $
              {portfolio.usdBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div>
            <Label className="text-xs mb-1 block">USD Amount</Label>
            <Input
              data-ocid="trade.input"
              type="number"
              placeholder="100.00"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="bg-background border-border font-mono"
            />
          </div>

          {buyUsd > 0 && (
            <div
              className="rounded-lg p-3 space-y-1.5 text-xs"
              style={{ background: "oklch(0.13 0.013 240)" }}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">You get</span>
                <span className="font-mono">
                  {buyCoins.toFixed(6)} {selectedSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brokerage (0.1%)</span>
                <span className="font-mono text-yellow-400">
                  ${buyBrokerage.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total Cost</span>
                <span className="font-mono">${buyTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_BUY_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setBuyAmount(String(amt))}
                className="text-xs py-1.5 rounded-md border border-border hover:border-primary transition-colors text-muted-foreground hover:text-foreground"
              >
                ${amt}
              </button>
            ))}
          </div>

          <Button
            data-ocid="trade.primary_button"
            className="w-full font-bold py-5"
            style={{
              background: "oklch(0.72 0.18 145)",
              color: "oklch(0.12 0.012 240)",
            }}
            onClick={handleBuy}
          >
            Buy {selectedSymbol}
          </Button>
        </TabsContent>

        {/* SELL */}
        <TabsContent value="sell" className="p-4 space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Holding</span>
            <span className="font-mono">
              {holding ? `${holding.amount.toFixed(6)} ${selectedSymbol}` : "0"}
            </span>
          </div>

          <div>
            <Label className="text-xs mb-1 block">
              {selectedSymbol} Amount
            </Label>
            <Input
              data-ocid="trade.input"
              type="number"
              placeholder="0.001"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="bg-background border-border font-mono"
            />
          </div>

          {sellCoins > 0 && (
            <div
              className="rounded-lg p-3 space-y-1.5 text-xs"
              style={{ background: "oklch(0.13 0.013 240)" }}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Value</span>
                <span className="font-mono">${sellGross.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brokerage (0.1%)</span>
                <span className="font-mono text-yellow-400">
                  -${sellBrokerage.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">STT Tax (0.025%)</span>
                <span className="font-mono text-yellow-400">
                  -${sellSTT.toFixed(4)}
                </span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between font-semibold">
                <span>Net Proceeds</span>
                <span className="font-mono text-coin-mint">
                  ${sellNet.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Quick sell buttons */}
          {holding && (
            <div className="grid grid-cols-4 gap-2">
              {QUICK_SELL_PCTS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    setSellAmount(
                      String(((holding.amount * pct) / 100).toFixed(6)),
                    )
                  }
                  className="text-xs py-1.5 rounded-md border border-border hover:border-destructive transition-colors text-muted-foreground hover:text-foreground"
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

          <Button
            data-ocid="trade.delete_button"
            className="w-full font-bold py-5"
            style={{
              background: "oklch(0.62 0.22 22)",
              color: "oklch(0.98 0.005 0)",
            }}
            onClick={handleSell}
          >
            Sell {selectedSymbol}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
