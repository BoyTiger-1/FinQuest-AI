import "dotenv/config";
// @ts-ignore
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { MODULES_DATA } from "../lib/data/modules";
import { BADGES } from "../lib/gamification";

const dbUrl = `file:${path.resolve(process.cwd(), "prisma/dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
      },
    });
  }
  console.log(`✅ Seeded ${BADGES.length} badges`);

  for (const moduleData of MODULES_DATA) {
    const { lessons, ...moduleFields } = moduleData;
    const modId = `mod-${moduleFields.order}`;

    await prisma.module.upsert({
      where: { id: modId },
      update: { title: moduleFields.title, description: moduleFields.description },
      create: { id: modId, ...moduleFields },
    });

    for (const lesson of lessons) {
      const lessonId = `lesson-${modId}-${lesson.order}`;
      await prisma.lesson.upsert({
        where: { id: lessonId },
        update: { title: lesson.title, content: lesson.content },
        create: {
          id: lessonId,
          moduleId: modId,
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
          order: lesson.order,
          xpReward: lesson.xpReward,
          questions: JSON.stringify(lesson.questions),
        },
      });
    }

    console.log(`✅ Seeded: ${moduleFields.title} (${lessons.length} lessons)`);
  }

  console.log("🎉 Database seeded!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
