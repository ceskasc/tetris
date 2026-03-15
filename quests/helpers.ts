import { questDefinitions } from "@/data/quests";
import type { QuestProgress } from "@/types";

export function buildQuestEntries(progress: QuestProgress[]) {
  return questDefinitions.map((quest) => {
    const userProgress = progress.find((entry) => entry.questId === quest.id);
    const ilerleme = userProgress?.ilerleme ?? 0;

    return {
      ...quest,
      ilerleme,
      tamamlandi: userProgress?.tamamlandi ?? false,
      odulAlindi: userProgress?.odulAlindi ?? false,
      oran: Math.min(100, Math.round((ilerleme / quest.hedef) * 100)),
    };
  });
}

export function getFeaturedQuests(progress: QuestProgress[]) {
  return buildQuestEntries(progress)
    .sort((left, right) => Number(left.tamamlandi) - Number(right.tamamlandi))
    .slice(0, 4);
}
