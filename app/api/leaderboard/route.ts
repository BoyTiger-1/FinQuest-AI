import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { xpToLevel } from "@/lib/gamification";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.user.findMany({
    orderBy: { xp: "desc" },
    take: 20,
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name,
    xp: u.xp,
    level: xpToLevel(u.xp),
    streak: u.streak,
    isCurrentUser: u.id === user.id,
  }));

  return NextResponse.json(leaderboard);
}
