export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function levelToXP(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = xpToLevel(xp);
  const currentLevelXP = levelToXP(level);
  const nextLevelXP = levelToXP(level + 1);
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, progress: Math.round((current / needed) * 100) };
}

export const BADGES = [
  { id: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: "🎯", rarity: "common" },
  { id: "streak-7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", rarity: "uncommon" },
  { id: "streak-30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "⚡", rarity: "rare" },
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "⭐", rarity: "uncommon" },
  { id: "level-10", name: "Finance Pro", description: "Reach level 10", icon: "🏆", rarity: "rare" },
  { id: "budget-master", name: "Budget Master", description: "Complete personal finance module", icon: "💰", rarity: "uncommon" },
  { id: "stock-guru", name: "Stock Guru", description: "Complete stock market module", icon: "📈", rarity: "rare" },
  { id: "business-tycoon", name: "Business Tycoon", description: "Complete business module", icon: "🏢", rarity: "rare" },
  { id: "perfect-score", name: "Perfectionist", description: "Score 100% on a quiz", icon: "💎", rarity: "rare" },
  { id: "analysis-ace", name: "Analysis Ace", description: "Use the AI analysis tool", icon: "🤖", rarity: "common" },
  { id: "investor", name: "Investor", description: "Buy your first stock", icon: "💹", rarity: "common" },
  { id: "debt-free", name: "Debt Free", description: "Pay off all debt in personal sim", icon: "🌟", rarity: "epic" },
];

export function checkBadgeEligibility(
  user: { xp: number; level: number; streak: number },
  completedLessonCount: number,
  perfectScores: number,
  usedAnalysis: boolean,
  boughtStock: boolean,
  debtFree: boolean
): string[] {
  const earned: string[] = [];

  if (completedLessonCount >= 1) earned.push("first-lesson");
  if (user.streak >= 7) earned.push("streak-7");
  if (user.streak >= 30) earned.push("streak-30");
  if (user.level >= 5) earned.push("level-5");
  if (user.level >= 10) earned.push("level-10");
  if (perfectScores >= 1) earned.push("perfect-score");
  if (usedAnalysis) earned.push("analysis-ace");
  if (boughtStock) earned.push("investor");
  if (debtFree) earned.push("debt-free");

  return earned;
}
