import { ACHIEVEMENTS } from "../data/achievements.js";
import { getDerivedStats } from "./stats.js";
import { unlockAchievement, isAchievementUnlocked, getUnlockedAchievementIds } from "./state.js";

// Checks all achievements against current derived stats, unlocks any newly
// earned ones, and returns the list of newly unlocked achievement objects.
export function checkAchievements() {
  const stats = getDerivedStats();
  const newly = [];
  ACHIEVEMENTS.forEach(a => {
    if (isAchievementUnlocked(a.id)) return;
    try {
      if (a.check(stats)) {
        const did = unlockAchievement(a.id);
        if (did) newly.push(a);
      }
    } catch (e) {
      console.error("Achievement check failed:", a.id, e);
    }
  });
  return newly;
}

export function getAllAchievementsWithStatus() {
  const unlockedIds = new Set(getUnlockedAchievementIds());
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlockedIds.has(a.id) }));
}

export function getTotalEarnedPoints() {
  const unlockedIds = new Set(getUnlockedAchievementIds());
  return ACHIEVEMENTS.reduce((sum, a) => sum + (unlockedIds.has(a.id) ? a.points : 0), 0);
}
