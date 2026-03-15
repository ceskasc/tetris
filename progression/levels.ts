import { modeDefinitions } from "@/data/modes";
import type { GameModeId, GameSessionSummary, ProgressionSnapshot } from "@/types";

const BASE_LEVEL_STEP = 220;

export function getXpForLevel(level: number) {
  let total = 0;

  for (let index = 1; index < level; index += 1) {
    total += BASE_LEVEL_STEP + index * 48;
  }

  return total;
}

export function getLevelFromXp(xp: number) {
  let level = 1;

  while (getXpForLevel(level + 1) <= xp) {
    level += 1;
  }

  return level;
}

export function getModeMultiplier(mode: GameModeId) {
  return modeDefinitions.find((entry) => entry.id === mode)?.odulCarpani ?? 1;
}

export function calculateSessionXp(summary: Omit<GameSessionSummary, "kazanilanXp">) {
  const tempo = getModeMultiplier(summary.mod);
  const participation = 90;
  const scoreBonus = Math.floor(summary.skor / 850);
  const lineBonus = summary.satir * 8;
  const comboBonus = summary.comboEnYuksek * 18;
  const perfectBonus = summary.perfectClear * 220;
  const b2bBonus = summary.backToBack * 14;
  const resultBonus = summary.sonuc === "galibiyet" ? 180 : 0;
  const cleanPlayBonus = Math.max(0, 60 - summary.hatalar * 8);

  return Math.round(
    (participation +
      scoreBonus +
      lineBonus +
      comboBonus +
      perfectBonus +
      b2bBonus +
      resultBonus +
      cleanPlayBonus) *
      tempo,
  );
}

export function applyXp(
  snapshot: ProgressionSnapshot,
  earnedXp: number,
): ProgressionSnapshot {
  const totalXp = snapshot.xp + earnedXp;
  const level = getLevelFromXp(totalXp);

  return {
    ...snapshot,
    xp: totalXp,
    level,
    nextLevelXp: getXpForLevel(level + 1),
  };
}
