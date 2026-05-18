import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let state = await db.personalFinanceState.findUnique({ where: { userId: user.id } });
  if (!state) {
    state = await db.personalFinanceState.create({ data: { userId: user.id } });
  }
  return NextResponse.json({ ...state, history: JSON.parse(state.history) });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, value } = await req.json();

  let state = await db.personalFinanceState.findUnique({ where: { userId: user.id } });
  if (!state) {
    state = await db.personalFinanceState.create({ data: { userId: user.id } });
  }

  const history: object[] = JSON.parse(state.history);

  let updates: Partial<typeof state> = {};
  let event = "";

  switch (action) {
    case "setup": {
      const v = value as { income: number; rent: number; food: number; transport: number; utilities: number; insurance: number; other: number; savings: number; investments: number; debt: number; creditScore: number };
      const updated = await db.personalFinanceState.update({
        where: { userId: user.id },
        data: {
          income: Number(v.income) || 0,
          rent: Number(v.rent) || 0,
          food: Number(v.food) || 0,
          transport: Number(v.transport) || 0,
          utilities: Number(v.utilities) || 0,
          insurance: Number(v.insurance) || 0,
          other: Number(v.other) || 0,
          savings: Number(v.savings) || 0,
          investments: Number(v.investments) || 0,
          debt: Number(v.debt) || 0,
          creditScore: Number(v.creditScore) || 0,
          cash: Number(v.income) || 0,
          setupComplete: true,
        },
      });
      return NextResponse.json({ ...updated, history: JSON.parse(updated.history), event: "Setup complete" });
    }
    case "advance_month": {
      // Monthly income and expenses
      const savingsRate = (state.income - state.rent - state.food - state.transport - state.utilities) / state.income;
      const monthlyNet = state.income - state.rent - state.food - state.transport - state.utilities;
      const investmentReturn = state.investments * (0.08 / 12);
      const debtInterest = state.debt * (0.18 / 12);
      const newCash = state.cash + monthlyNet - debtInterest + investmentReturn;
      const newInvestments = state.investments + state.investments * (0.08 / 12);

      // Random life event (10% chance)
      let lifeEvent = null;
      if (Math.random() < 0.1) {
        const events = [
          { name: "Car repair", cash: -800, description: "Your car needed repairs" },
          { name: "Medical bill", cash: -500, description: "Unexpected medical expense" },
          { name: "Bonus!", cash: 1500, description: "You received a work bonus!" },
          { name: "Sale!", cash: -200, description: "You bought something on sale" },
        ];
        lifeEvent = events[Math.floor(Math.random() * events.length)];
      }

      const finalCash = newCash + (lifeEvent?.cash ?? 0);

      // Credit score improvement
      let creditScore = state.creditScore;
      if (monthlyNet > 0) creditScore = Math.min(850, creditScore + 2);
      if (state.debt > state.income * 3) creditScore = Math.max(300, creditScore - 1);

      const snapshot = {
        month: state.month,
        cash: Math.round(finalCash),
        investments: Math.round(newInvestments),
        debt: Math.round(state.debt - Math.max(0, monthlyNet * 0.2)),
        creditScore,
        lifeEvent,
      };
      history.push(snapshot);

      updates = {
        cash: Math.round(finalCash),
        investments: Math.round(newInvestments),
        debt: Math.max(0, Math.round(state.debt - Math.max(0, monthlyNet * 0.2))),
        creditScore,
        month: state.month + 1,
        history: JSON.stringify(history.slice(-24)),
      };
      event = lifeEvent ? `Life event: ${lifeEvent.name}` : "Month advanced";
      break;
    }
    case "invest": {
      const amount = Number(value);
      if (amount > state.cash || amount <= 0) {
        return NextResponse.json({ error: "Insufficient cash" }, { status: 400 });
      }
      updates = {
        cash: state.cash - amount,
        investments: state.investments + amount,
      };
      event = `Invested $${amount}`;
      break;
    }
    case "pay_debt": {
      const amount = Math.min(Number(value), state.debt, state.cash);
      if (amount <= 0) return NextResponse.json({ error: "Cannot pay" }, { status: 400 });
      updates = {
        cash: state.cash - amount,
        debt: state.debt - amount,
        creditScore: Math.min(850, state.creditScore + 5),
      };
      event = `Paid $${amount} toward debt`;
      break;
    }
    case "save": {
      const amount = Number(value);
      if (amount > state.cash || amount <= 0) {
        return NextResponse.json({ error: "Insufficient cash" }, { status: 400 });
      }
      updates = { cash: state.cash - amount, savings: state.savings + amount };
      event = `Saved $${amount}`;
      break;
    }
    case "update_budget": {
      const { rent, food, transport, utilities } = value;
      updates = { rent, food, transport, utilities };
      event = "Budget updated";
      break;
    }
    case "reset": {
      await db.personalFinanceState.delete({ where: { userId: user.id } });
      state = await db.personalFinanceState.create({ data: { userId: user.id } });
      return NextResponse.json({ ...state, history: [] });
    }
  }

  const updated = await db.personalFinanceState.update({
    where: { userId: user.id },
    data: updates as any,
  });

  return NextResponse.json({ ...updated, history: JSON.parse(updated.history), event });
}
