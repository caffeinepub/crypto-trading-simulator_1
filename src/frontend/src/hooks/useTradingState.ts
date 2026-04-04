import { useCallback, useState } from "react";
import { CRYPTO_ASSETS } from "../data/cryptoAssets";
import type { Holding, PortfolioState, Trade } from "../types/trading";

const INITIAL_BALANCE = 100000;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useTradingState() {
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    usdBalance: INITIAL_BALANCE,
    holdings: [],
    trades: [],
  });

  const getPrice = useCallback((symbol: string): number => {
    const asset = CRYPTO_ASSETS.find((a) => a.symbol === symbol);
    return asset?.price ?? 0;
  }, []);

  const getPortfolioValue = useCallback(
    (state: PortfolioState): number => {
      const holdingsValue = state.holdings.reduce((sum, h) => {
        return sum + h.amount * getPrice(h.symbol);
      }, 0);
      return state.usdBalance + holdingsValue;
    },
    [getPrice],
  );

  const executeBuy = useCallback(
    (symbol: string, usdAmount: number) => {
      const price = getPrice(symbol);
      if (price === 0) return { success: false, error: "Invalid asset" };

      const brokerage = usdAmount * 0.001;
      const totalCost = usdAmount + brokerage;
      const coinAmount = usdAmount / price;

      if (totalCost > portfolio.usdBalance) {
        return { success: false, error: "Insufficient balance" };
      }

      const trade: Trade = {
        id: generateId(),
        type: "buy",
        symbol,
        amount: coinAmount,
        price,
        total: usdAmount,
        brokerage,
        tax: 0,
        timestamp: new Date(),
      };

      setPortfolio((prev) => {
        const existingHolding = prev.holdings.find((h) => h.symbol === symbol);
        let newHoldings: Holding[];
        if (existingHolding) {
          const totalAmount = existingHolding.amount + coinAmount;
          const avgPrice =
            (existingHolding.amount * existingHolding.avgBuyPrice +
              coinAmount * price) /
            totalAmount;
          newHoldings = prev.holdings.map((h) =>
            h.symbol === symbol
              ? { ...h, amount: totalAmount, avgBuyPrice: avgPrice }
              : h,
          );
        } else {
          newHoldings = [
            ...prev.holdings,
            { symbol, amount: coinAmount, avgBuyPrice: price },
          ];
        }
        return {
          ...prev,
          usdBalance: prev.usdBalance - totalCost,
          holdings: newHoldings,
          trades: [trade, ...prev.trades],
        };
      });

      return { success: true, trade };
    },
    [portfolio.usdBalance, getPrice],
  );

  const executeSell = useCallback(
    (symbol: string, coinAmount: number) => {
      const price = getPrice(symbol);
      if (price === 0) return { success: false, error: "Invalid asset" };

      const holding = portfolio.holdings.find((h) => h.symbol === symbol);
      if (!holding || holding.amount < coinAmount) {
        return { success: false, error: "Insufficient holdings" };
      }

      const grossUsd = coinAmount * price;
      const brokerage = grossUsd * 0.001;
      const stt = grossUsd * 0.00025;
      const netUsd = grossUsd - brokerage - stt;

      const trade: Trade = {
        id: generateId(),
        type: "sell",
        symbol,
        amount: coinAmount,
        price,
        total: grossUsd,
        brokerage,
        tax: stt,
        timestamp: new Date(),
      };

      setPortfolio((prev) => {
        const newHoldings = prev.holdings
          .map((h) =>
            h.symbol === symbol ? { ...h, amount: h.amount - coinAmount } : h,
          )
          .filter((h) => h.amount > 0.000001);
        return {
          ...prev,
          usdBalance: prev.usdBalance + netUsd,
          holdings: newHoldings,
          trades: [trade, ...prev.trades],
        };
      });

      return { success: true, trade };
    },
    [portfolio.holdings, getPrice],
  );

  return { portfolio, executeBuy, executeSell, getPortfolioValue, getPrice };
}
