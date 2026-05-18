// Geometric Brownian Motion for realistic stock price simulation
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  mu: number;   // drift (expected return)
  sigma: number; // volatility
}

export const STOCKS: Stock[] = [
  { symbol: "APPL", name: "Apple Technologies", sector: "Technology", basePrice: 185, mu: 0.12, sigma: 0.25 },
  { symbol: "GOOG", name: "Google Systems", sector: "Technology", basePrice: 140, mu: 0.10, sigma: 0.22 },
  { symbol: "AMZN", name: "Amazon Commerce", sector: "E-Commerce", basePrice: 178, mu: 0.14, sigma: 0.28 },
  { symbol: "MSFT", name: "Microsoft Corp", sector: "Technology", basePrice: 415, mu: 0.11, sigma: 0.20 },
  { symbol: "TSLA", name: "Tesla Motors", sector: "Automotive", basePrice: 250, mu: 0.08, sigma: 0.45 },
  { symbol: "META", name: "MetaVerse Inc", sector: "Social Media", basePrice: 490, mu: 0.13, sigma: 0.30 },
  { symbol: "NVDA", name: "NVidia Chips", sector: "Semiconductors", basePrice: 875, mu: 0.20, sigma: 0.40 },
  { symbol: "JPM", name: "JP Morgan Bank", sector: "Finance", basePrice: 195, mu: 0.09, sigma: 0.18 },
  { symbol: "JNJ", name: "Johnson Health", sector: "Healthcare", basePrice: 158, mu: 0.07, sigma: 0.15 },
  { symbol: "WMT", name: "Walmart Retail", sector: "Retail", basePrice: 67, mu: 0.06, sigma: 0.14 },
  { symbol: "KO", name: "Coca-Cola Co", sector: "Consumer Goods", basePrice: 62, mu: 0.05, sigma: 0.12 },
  { symbol: "SPY", name: "S&P 500 Index", sector: "Index Fund", basePrice: 520, mu: 0.10, sigma: 0.16 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function boxMullerTransform(u1: number, u2: number): number {
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function getStockPrice(stock: Stock, dayOffset: number): number {
  const dt = 1 / 252; // one trading day
  const rng = seededRandom(stock.symbol.charCodeAt(0) * 1000 + dayOffset * 7);

  let price = stock.basePrice;
  for (let i = 0; i < dayOffset; i++) {
    const u1 = Math.max(0.0001, rng());
    const u2 = Math.max(0.0001, rng());
    const z = boxMullerTransform(u1, u2);
    const drift = (stock.mu - 0.5 * stock.sigma ** 2) * dt;
    const diffusion = stock.sigma * Math.sqrt(dt) * z;
    price = price * Math.exp(drift + diffusion);
  }
  return Math.max(1, Math.round(price * 100) / 100);
}

export function getHistoricalPrices(
  stock: Stock,
  days: number,
  currentDay: number
): { date: string; price: number; volume: number }[] {
  const result = [];
  const rng = seededRandom(stock.symbol.charCodeAt(0) * 9999);
  for (let i = Math.max(0, currentDay - days); i <= currentDay; i++) {
    const price = getStockPrice(stock, i);
    result.push({
      date: new Date(Date.now() - (currentDay - i) * 86400000).toISOString().split("T")[0],
      price,
      volume: Math.floor(rng() * 5000000 + 500000),
    });
  }
  return result;
}

export function getCurrentDay(): number {
  const epoch = new Date("2024-01-01").getTime();
  return Math.floor((Date.now() - epoch) / 86400000);
}

export function calculatePortfolioMetrics(
  holdings: { symbol: string; shares: number; avgCost: number }[],
  currentDay: number
): {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  gainPercent: number;
  beta: number;
  sharpeRatio: number;
} {
  let totalValue = 0;
  let totalCost = 0;
  let weightedBeta = 0;

  for (const holding of holdings) {
    const stock = STOCKS.find((s) => s.symbol === holding.symbol);
    if (!stock) continue;
    const price = getStockPrice(stock, currentDay);
    const value = price * holding.shares;
    const cost = holding.avgCost * holding.shares;
    totalValue += value;
    totalCost += cost;
    const stockBeta = stock.sigma / 0.16; // relative to market
    weightedBeta += stockBeta * (value / Math.max(totalValue, 1));
  }

  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Simplified Sharpe ratio (excess return / volatility)
  const sharpeRatio = weightedBeta > 0 ? gainPercent / (weightedBeta * 10) : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalGain: Math.round(totalGain * 100) / 100,
    gainPercent: Math.round(gainPercent * 100) / 100,
    beta: Math.round(weightedBeta * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
  };
}
