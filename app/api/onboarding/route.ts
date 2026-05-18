import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { goals, experience, finance, virtualCash } = await req.json();

    if (!finance?.income) {
      return NextResponse.json({ error: "Income is required" }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        goals: JSON.stringify(goals ?? []),
        experience: experience ?? "beginner",
        virtualCash: Number(virtualCash) || 10000,
        onboarded: true,
      },
    });

    await db.personalFinanceState.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        income: Number(finance.income) || 0,
        rent: Number(finance.rent) || 0,
        food: Number(finance.food) || 0,
        transport: Number(finance.transport) || 0,
        utilities: Number(finance.utilities) || 0,
        insurance: Number(finance.insurance) || 0,
        other: Number(finance.other) || 0,
        savings: Number(finance.savings) || 0,
        investments: Number(finance.investments) || 0,
        debt: Number(finance.debt) || 0,
        creditScore: Number(finance.creditScore) || 0,
        cash: Number(finance.income) || 0,
        setupComplete: true,
      },
      update: {
        income: Number(finance.income) || 0,
        rent: Number(finance.rent) || 0,
        food: Number(finance.food) || 0,
        transport: Number(finance.transport) || 0,
        utilities: Number(finance.utilities) || 0,
        insurance: Number(finance.insurance) || 0,
        other: Number(finance.other) || 0,
        savings: Number(finance.savings) || 0,
        investments: Number(finance.investments) || 0,
        debt: Number(finance.debt) || 0,
        creditScore: Number(finance.creditScore) || 0,
        cash: Number(finance.income) || 0,
        setupComplete: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ onboarded: user.onboarded });
}
