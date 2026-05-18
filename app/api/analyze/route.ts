import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { analyzeFinancials } from "@/lib/gemini";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, data } = await req.json();

  let analysisData = data;

  if (type === "personal" && !data) {
    const state = await db.personalFinanceState.findUnique({ where: { userId: user.id } });
    if (!state) return NextResponse.json({ error: "No simulation data" }, { status: 404 });
    analysisData = {
      type: "Personal Finance",
      income: state.income,
      expenses: { rent: state.rent, food: state.food, transport: state.transport, utilities: state.utilities },
      cash: state.cash,
      savings: state.savings,
      investments: state.investments,
      debt: state.debt,
      creditScore: state.creditScore,
      month: state.month,
    };
  }

  if (type === "business" && !data) {
    const state = await db.businessState.findUnique({ where: { userId: user.id } });
    if (!state) return NextResponse.json({ error: "No simulation data" }, { status: 404 });
    analysisData = {
      type: "Business Finance",
      cash: state.cash,
      revenue: state.revenue,
      expenses: state.expenses,
      employees: state.employees,
      productPrice: state.productPrice,
      marketingBudget: state.marketingBudget,
      rdBudget: state.rdBudget,
      period: state.period,
    };
  }

  // Award analysis badge
  try {
    await db.userBadge.create({ data: { userId: user.id, badgeId: "analysis-ace" } });
  } catch {}

  const analysis = await analyzeFinancials(analysisData);
  return NextResponse.json({ analysis });
}
