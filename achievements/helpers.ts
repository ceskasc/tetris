import { achievementDefinitions } from "@/data/achievements";
import type { AchievementProgress } from "@/types";

export function buildAchievementEntries(progress: AchievementProgress[]) {
  return achievementDefinitions.map((achievement) => {
    const userProgress = progress.find(
      (entry) => entry.achievementId === achievement.id,
    );
    const ilerleme = userProgress?.ilerleme ?? 0;

    return {
      ...achievement,
      ilerleme,
      acildi: userProgress?.acildi ?? false,
      oran: Math.min(100, Math.round((ilerleme / achievement.hedef) * 100)),
      acilmaTarihi: userProgress?.acilmaTarihi,
    };
  });
}

export function getRecentlyUnlocked(progress: AchievementProgress[]) {
  return buildAchievementEntries(progress)
    .filter((entry) => entry.acildi)
    .sort((left, right) =>
      new Date(right.acilmaTarihi ?? 0).getTime() -
      new Date(left.acilmaTarihi ?? 0).getTime(),
    )
    .slice(0, 4);
}
