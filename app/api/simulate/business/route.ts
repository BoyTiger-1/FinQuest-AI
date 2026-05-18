import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { simulateBusinessPeriod, generateFinancialStatements } from "@/lib/ml/business-sim";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let state = await db.businessState.findUnique({ where: { userId: user.id } });
  if (!state) {
    state = await db.businessState.create({ data: { userId: user.id } });
  }

  const history = JSON.parse(state.history);
  const statements = generateFinancialStatements({
    cash: state.cash,
    revenue: state.revenue,
    expenses: state.expenses,
    employees: state.employees,
    productPrice: state.productPrice,
    marketingBudget: state.marketingBudget,
    rdBudget: state.rdBudget,
    history,
  });

  return NextResponse.json({ ...state, history, statements });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, decisions } = await req.json();

  let state = await db.businessState.findUnique({ where: { userId: user.id } });
  if (!state) {
    state = await db.businessState.create({ data: { userId: user.id } });
  }

  const history: any[] = JSON.parse(state.history);

  if (action === "advance_period") {
    const d = {
      productPrice: decisions?.productPrice ?? state.productPrice,
      marketingBudget: decisions?.marketingBudget ?? state.marketingBudget,
      rdBudget: decisions?.rdBudget ?? state.rdBudget,
      employees: decisions?.employees ?? state.employees,
    };

    const result = simulateBusinessPeriod(
      {
        cash: state.cash,
        period: state.period,
        employees: d.employees,
        productPrice: d.productPrice,
        marketingBudget: d.marketingBudget,
        rdBudget: d.rdBudget,
      },
      d
    );

    const operatingCosts = d.marketingBudget + d.rdBudget + d.employees * 5000 + 5000;
    const newCash = state.cash + result.cashFlow;

    const snapshot = {
      period: state.period,
      ...result,
      ...d,
      cash: Math.round(newCash),
    };
    history.push(snapshot);

    const updated = await db.businessState.update({
      where: { userId: user.id },
      data: {
        cash: Math.round(newCash),
        revenue: result.revenue,
        expenses: operatingCosts,
        employees: d.employees,
        productPrice: d.productPrice,
        marketingBudget: d.marketingBudget,
        rdBudget: d.rdBudget,
        unitsSold: result.unitsSold,
        period: state.period + 1,
        history: JSON.stringify(history.slice(-24)),
      },
    });

    const statements = generateFinancialStatements({
      cash: updated.cash,
      revenue: updated.revenue,
      expenses: updated.expenses,
      employees: updated.employees,
      productPrice: updated.productPrice,
      marketingBudget: updated.marketingBudget,
      rdBudget: updated.rdBudget,
      history,
    });

    return NextResponse.json({ ...updated, history, statements, periodResult: result });
  }

  if (action === "reset") {
    await db.businessState.delete({ where: { userId: user.id } });
    state = await db.businessState.create({ data: { userId: user.id } });
    return NextResponse.json({ ...state, history: [], statements: null });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
