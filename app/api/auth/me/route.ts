import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { xpToLevel, xpToNextLevel } from "@/lib/gamification";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const badges = await db.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
  });

  const progress = await db.learningProgress.findMany({
    where: { userId: user.id, completed: true },
  });

  return NextResponse.json({
    ...user,
    level: xpToLevel(user.xp),
    nextLevel: xpToNextLevel(user.xp),
    badges: badges.map((b) => b.badge),
    completedLessons: progress.length,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("auth-token");
  return response;
}
