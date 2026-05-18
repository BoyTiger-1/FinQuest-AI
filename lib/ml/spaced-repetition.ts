// SM-2 spaced repetition algorithm
export interface SM2Card {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export function sm2Update(card: SM2Card, quality: number): SM2Card & { nextReview: Date } {
  // quality: 0-5 (0-2 = fail, 3-5 = pass)
  let { interval, easeFactor, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    repetitions = 0;
    interval = 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { interval, easeFactor, repetitions, nextReview };
}

export function scoreToQuality(percentScore: number): number {
  if (percentScore >= 0.9) return 5;
  if (percentScore >= 0.8) return 4;
  if (percentScore >= 0.7) return 3;
  if (percentScore >= 0.6) return 2;
  if (percentScore >= 0.4) return 1;
  return 0;
}

export function getDueLessons(
  cards: Array<{ lessonId: string; nextReview: Date | null; completed: boolean }>
): string[] {
  const now = new Date();
  return cards
    .filter((c) => c.completed && c.nextReview && c.nextReview <= now)
    .map((c) => c.lessonId);
}
