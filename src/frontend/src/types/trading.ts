export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

export interface Holding {
  symbol: string;
  amount: number;
  avgBuyPrice: number;
}

export interface Trade {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  amount: number;
  price: number;
  total: number;
  brokerage: number;
  tax: number;
  timestamp: Date;
}

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioState {
  usdBalance: number;
  holdings: Holding[];
  trades: Trade[];
}

export type AppView =
  | "landing"
  | "kyc"
  | "payment"
  | "dashboard"
  | "admin"
  | "claim-admin";
