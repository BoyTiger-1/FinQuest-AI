import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("id");
  if (!lessonId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: true,
      progress: { where: { userId: user.id } },
    },
  });

  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...lesson,
    questions: JSON.parse(lesson.questions),
    progress: lesson.progress[0] ?? null,
  });
}
