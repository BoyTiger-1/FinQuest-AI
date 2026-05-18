import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sm2Update, scoreToQuality } from "@/lib/ml/spaced-repetition";
import { xpToLevel, BADGES } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, score } = await req.json();
  if (!lessonId || score === undefined) {
    return NextResponse.json({ error: "Missing lessonId or score" }, { status: 400 });
  }

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const existing = await db.learningProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });

  const quality = scoreToQuality(score);
  const sm2 = sm2Update(
    {
      interval: existing?.interval ?? 1,
      easeFactor: existing?.easeFactor ?? 2.5,
      repetitions: existing?.repetitions ?? 0,
    },
    quality
  );

  const xpEarned = score >= 0.7 ? lesson.xpReward : Math.floor(lesson.xpReward * 0.3);

  await db.learningProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {
      completed: score >= 0.5,
      score,
      nextReview: sm2.nextReview,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      repetitions: sm2.repetitions,
      completedAt: score >= 0.5 ? new Date() : undefined,
    },
    create: {
      userId: user.id,
      lessonId,
      completed: score >= 0.5,
      score,
      nextReview: sm2.nextReview,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      repetitions: sm2.repetitions,
      completedAt: score >= 0.5 ? new Date() : undefined,
    },
  });

  const fullUser = await db.user.update({
    where: { id: user.id },
    data: { xp: { increment: xpEarned } },
  });

  // Check for badge eligibility
  const completedCount = await db.learningProgress.count({
    where: { userId: user.id, completed: true },
  });
  const perfectCount = await db.learningProgress.count({
    where: { userId: user.id, score: { gte: 1.0 } },
  });

  const newBadges: string[] = [];
  if (completedCount === 1) newBadges.push("first-lesson");
  if (score >= 1.0) newBadges.push("perfect-score");

  for (const badgeId of newBadges) {
    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) continue;
    try {
      await db.userBadge.create({ data: { userId: user.id, badgeId } });
    } catch {}
  }

  return NextResponse.json({
    xpEarned,
    newXp: fullUser.xp,
    newLevel: xpToLevel(fullUser.xp),
    nextReview: sm2.nextReview,
    passed: score >= 0.5,
    newBadges,
  });
}
