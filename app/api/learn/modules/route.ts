import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const modules = await db.module.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          progress: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  const enriched = modules.map((mod) => {
    const totalLessons = mod.lessons.length;
    const completedLessons = mod.lessons.filter((l) =>
      l.progress.some((p) => p.completed)
    ).length;
    return {
      ...mod,
      totalLessons,
      completedLessons,
      progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      lessons: mod.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        order: l.order,
        xpReward: l.xpReward,
        completed: l.progress.some((p) => p.completed),
        score: l.progress[0]?.score ?? null,
      })),
    };
  });

  return NextResponse.json(enriched);
}
