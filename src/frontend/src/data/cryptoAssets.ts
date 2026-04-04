import type { CryptoAsset } from "../types/trading";

export const CRYPTO_ASSETS: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 43250, change24h: 2.34, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 2285, change24h: -1.12, icon: "Ξ" },
  { symbol: "BNB", name: "BNB", price: 315, change24h: 0.87, icon: "B" },
  { symbol: "XRP", name: "XRP", price: 0.62, change24h: -0.45, icon: "✕" },
  { symbol: "SOL", name: "Solana", price: 98.5, change24h: 4.21, icon: "◎" },
  { symbol: "ADA", name: "Cardano", price: 0.485, change24h: -2.18, icon: "A" },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.085,
    change24h: 6.55,
    icon: "Ð",
  },
  { symbol: "MATIC", name: "Polygon", price: 0.91, change24h: 1.33, icon: "M" },
];

export function generateOHLC(
  basePrice: number,
  periods = 60,
): Array<{
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}> {
  const data: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> = [];
  let price = basePrice * 0.92;
  const now = Date.now();

  for (let i = periods; i >= 0; i--) {
    const volatility = basePrice * 0.015;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = Math.max(open + change, basePrice * 0.01);
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000 + 200);
    const ts = new Date(now - i * 60 * 60 * 1000);
    const timeStr = `${ts.getMonth() + 1}/${ts.getDate()} ${ts.getHours()}h`;
    data.push({ time: timeStr, open, high, low, close, volume });
    price = close;
  }
  return data;
}
