import type { StatisticsSummary } from "@/types";

export function getWinRate(summary: StatisticsSummary) {
  const total = summary.onlineGalibiyet + summary.onlineMaglubiyet;
  if (!total) {
    return 0;
  }

  return Math.round((summary.onlineGalibiyet / total) * 100);
}

export function getAverageMinutes(summary: StatisticsSummary) {
  return Math.round(summary.toplamDakika / Math.max(summary.toplamMac, 1));
}
