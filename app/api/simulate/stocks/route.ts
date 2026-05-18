import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  STOCKS,
  getStockPrice,
  getHistoricalPrices,
  getCurrentDay,
  calculatePortfolioMetrics,
} from "@/lib/ml/stock-simulation";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentDay = getCurrentDay();

  const holdings = await db.stockHolding.findMany({ where: { userId: user.id } });

  const stocksWithPrices = STOCKS.map((s) => {
    const price = getStockPrice(s, currentDay);
    const prevPrice = getStockPrice(s, currentDay - 1);
    const change = price - prevPrice;
    const changePercent = (change / prevPrice) * 100;
    const history = getHistoricalPrices(s, 30, currentDay);

    const holding = holdings.find((h) => h.symbol === s.symbol);

    return {
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      history,
      holding: holding
        ? {
            shares: holding.shares,
            avgCost: holding.avgCost,
            value: Math.round(price * holding.shares * 100) / 100,
            gain: Math.round((price - holding.avgCost) * holding.shares * 100) / 100,
            gainPercent: Math.round(((price - holding.avgCost) / holding.avgCost) * 10000) / 100,
          }
        : null,
    };
  });

  const portfolioHoldings = holdings.map((h) => ({
    symbol: h.symbol,
    shares: h.shares,
    avgCost: h.avgCost,
  }));

  const metrics = calculatePortfolioMetrics(portfolioHoldings, currentDay);
  const fullUser = await db.user.findUnique({ where: { id: user.id }, select: { virtualCash: true } });

  return NextResponse.json({
    stocks: stocksWithPrices,
    portfolio: {
      cash: fullUser?.virtualCash ?? 10000,
      holdings,
      metrics,
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, symbol, shares } = await req.json();
  const currentDay = getCurrentDay();

  const stock = STOCKS.find((s) => s.symbol === symbol);
  if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 });

  const price = getStockPrice(stock, currentDay);
  const fullUser = await db.user.findUnique({ where: { id: user.id } });
  if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (action === "buy") {
    const cost = price * shares;
    if (cost > fullUser.virtualCash) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const existing = await db.stockHolding.findUnique({
      where: { userId_symbol: { userId: user.id, symbol } },
    });

    if (existing) {
      const totalShares = existing.shares + shares;
      const newAvgCost = (existing.avgCost * existing.shares + price * shares) / totalShares;
      await db.stockHolding.update({
        where: { userId_symbol: { userId: user.id, symbol } },
        data: { shares: totalShares, avgCost: newAvgCost },
      });
    } else {
      await db.stockHolding.create({
        data: { userId: user.id, symbol, shares, avgCost: price },
      });
      // Award investor badge
      try {
        await db.userBadge.create({ data: { userId: user.id, badgeId: "investor" } });
      } catch {}
    }

    await db.user.update({ where: { id: user.id }, data: { virtualCash: { decrement: cost } } });

    return NextResponse.json({ ok: true, action: "bought", shares, price, cost: Math.round(cost * 100) / 100 });
  }

  if (action === "sell") {
    const holding = await db.stockHolding.findUnique({
      where: { userId_symbol: { userId: user.id, symbol } },
    });
    if (!holding || holding.shares < shares) {
      return NextResponse.json({ error: "Insufficient shares" }, { status: 400 });
    }

    const proceeds = price * shares;
    const newShares = holding.shares - shares;

    if (newShares < 0.001) {
      await db.stockHolding.delete({ where: { userId_symbol: { userId: user.id, symbol } } });
    } else {
      await db.stockHolding.update({
        where: { userId_symbol: { userId: user.id, symbol } },
        data: { shares: newShares },
      });
    }

    await db.user.update({ where: { id: user.id }, data: { virtualCash: { increment: proceeds } } });

    return NextResponse.json({ ok: true, action: "sold", shares, price, proceeds: Math.round(proceeds * 100) / 100 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
