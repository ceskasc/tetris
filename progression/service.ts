import { Prisma } from "@prisma/client";

import { achievementDefinitions } from "@/data/achievements";
import { cosmeticsCatalog } from "@/data/cosmetics";
import { dailyRewards, questDefinitions } from "@/data/quests";
import { prisma } from "@/db/prisma";
import { calculateSessionXp, getLevelFromXp } from "@/progression/levels";
import type { GameSessionSummary } from "@/types";

function getMetricDelta(
  metric: string,
  summary: GameSessionSummary,
  extra?: { tournamentJoined?: boolean },
) {
  switch (metric) {
    case "satir":
      return summary.satir;
    case "skor":
      return summary.skor;
    case "combo":
      return summary.comboEnYuksek;
    case "mac":
      return 1;
    case "online-galibiyet":
      return summary.sonuc === "galibiyet" ? 1 : 0;
    case "perfect-clear":
      return summary.perfectClear;
    case "zaman":
      return summary.sureMs;
    case "turnuva":
      return extra?.tournamentJoined ? 1 : 0;
    default:
      return 0;
  }
}

async function grantCosmetic(
  tx: Prisma.TransactionClient,
  userId: string,
  cosmeticId?: string,
) {
  if (!cosmeticId) {
    return;
  }

  const exists = await tx.userCosmetic.findUnique({
    where: {
      userId_cosmeticId: {
        userId,
        cosmeticId,
      },
    },
  });

  if (exists) {
    return;
  }

  await tx.userCosmetic.create({
    data: {
      userId,
      cosmeticId,
      isNew: true,
    },
  });

  await tx.userStatistics.update({
    where: { userId },
    data: {
      unlockedRewardCount: {
        increment: 1,
      },
    },
  });
}

async function createNotification(
  tx: Prisma.TransactionClient,
  userId: string,
  title: string,
  body: string,
  type: string,
  actionUrl?: string,
) {
  await tx.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      actionUrl,
    },
  });
}

export async function recordGameSession(userId: string, session: GameSessionSummary) {
  const earnedXp =
    session.kazanilanXp > 0
      ? session.kazanilanXp
      : calculateSessionXp(session);

  const userState = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      progression: true,
      statistics: true,
      quests: true,
      achievements: true,
      profile: true,
    },
  });

  const currentXp = userState.progression?.xp ?? 0;
  const totalXp = currentXp + earnedXp;
  const previousLevel = userState.progression?.level ?? 1;
  const nextLevel = getLevelFromXp(totalXp);
  const levelUpCount = Math.max(0, nextLevel - previousLevel);

  const gamesByMode = (userState.statistics?.gamesByMode ?? {}) as Record<
    string,
    number
  >;
  gamesByMode[session.mod] = (gamesByMode[session.mod] ?? 0) + 1;

  const totalMatches = (userState.statistics?.totalMatches ?? 0) + 1;
  const totalPlayMinutes =
    (userState.statistics?.totalPlayMinutes ?? 0) +
    Math.max(1, Math.round(session.sureMs / 60000));
  const totalScore = BigInt(userState.statistics?.totalScore ?? 0) + BigInt(session.skor);
  const averageScore = Math.round(Number(totalScore) / totalMatches);
  const averageMatchDurationMs = Math.round(
    ((userState.statistics?.averageMatchDurationMs ?? 0) *
      (totalMatches - 1) +
      session.sureMs) /
      totalMatches,
  );

  await prisma.$transaction(async (tx) => {
    await tx.gameSession.create({
      data: {
        userId,
        mode: session.mod,
        startedAt: new Date(Date.now() - session.sureMs),
        endedAt: new Date(),
        score: session.skor,
        lines: session.satir,
        level: session.level,
        comboMax: session.comboEnYuksek,
        perfectClears: session.perfectClear,
        durationMs: session.sureMs,
        metadata: {
          backToBack: session.backToBack,
          sonuc: session.sonuc,
          hatalar: session.hatalar,
        } as Prisma.InputJsonValue,
      },
    });

    await tx.userProgression.update({
      where: { userId },
      data: {
        xp: totalXp,
        level: nextLevel,
        stars: {
          increment: levelUpCount,
        },
        rankedRating:
          session.mod === "duello"
            ? {
                increment: session.sonuc === "galibiyet" ? 16 : -8,
              }
            : undefined,
      },
    });

    await tx.userStatistics.update({
      where: { userId },
      data: {
        totalMatches,
        totalPlayMinutes,
        totalScore,
        highScore: Math.max(userState.statistics?.highScore ?? 0, session.skor),
        totalLines: {
          increment: session.satir,
        },
        longestCombo: Math.max(
          userState.statistics?.longestCombo ?? 0,
          session.comboEnYuksek,
        ),
        perfectClearCount: {
          increment: session.perfectClear,
        },
        averageMatchDurationMs,
        averageScore,
        favoriteMode: session.mod,
        onlineWins:
          session.mod === "duello" && session.sonuc === "galibiyet"
            ? { increment: 1 }
            : undefined,
        onlineLosses:
          session.mod === "duello" && session.sonuc === "maglubiyet"
            ? { increment: 1 }
            : undefined,
        gamesByMode: gamesByMode as Prisma.InputJsonValue,
      },
    });

    for (const quest of questDefinitions) {
      const existing = userState.quests.find((entry) => entry.questId === quest.id);
      if (!existing) {
        continue;
      }

      const delta = getMetricDelta(quest.metric, session);
      if (!delta) {
        continue;
      }

      const nextProgress = Math.min(existing.goal, existing.progress + delta);
      const completed = nextProgress >= existing.goal;
      const newlyCompleted = completed && !existing.completed;

      await tx.userQuestProgress.update({
        where: { id: existing.id },
        data: {
          progress: nextProgress,
          completed,
          claimedAt: newlyCompleted ? new Date() : existing.claimedAt ?? undefined,
        },
      });

      if (newlyCompleted) {
        await tx.userProgression.update({
          where: { userId },
          data: {
            xp: {
              increment: quest.odulXp,
            },
          },
        });
        await grantCosmetic(tx, userId, quest.odulParca);
        await createNotification(
          tx,
          userId,
          `Görev tamamlandı: ${quest.ad}`,
          `${quest.odulXp} XP kazandın${quest.odulParca ? " ve yeni bir kozmetik açtın." : "."}`,
          "gorev",
          "/gorevler",
        );
      }
    }

    for (const achievement of achievementDefinitions) {
      const existing = userState.achievements.find(
        (entry) => entry.achievementId === achievement.id,
      );
      if (!existing) {
        continue;
      }

      const delta = getMetricDelta(achievement.metric, session);
      if (!delta) {
        continue;
      }

      const nextProgress = Math.min(existing.goal, existing.progress + delta);
      const unlocked = nextProgress >= existing.goal;
      const newlyUnlocked = unlocked && !existing.unlockedAt;

      await tx.userAchievementProgress.update({
        where: { id: existing.id },
        data: {
          progress: nextProgress,
          unlockedAt: newlyUnlocked ? new Date() : existing.unlockedAt ?? undefined,
          claimedAt: newlyUnlocked ? new Date() : existing.claimedAt ?? undefined,
        },
      });

      if (newlyUnlocked) {
        await tx.userProgression.update({
          where: { userId },
          data: {
            xp: {
              increment: achievement.odulXp,
            },
          },
        });
        await grantCosmetic(tx, userId, achievement.odulParca);
        await createNotification(
          tx,
          userId,
          `Başarım açıldı: ${achievement.ad}`,
          `${achievement.odulXp} XP hesabına işlendi.`,
          "basarim",
          "/basarimlar",
        );
      }
    }

    if (levelUpCount > 0) {
      await createNotification(
        tx,
        userId,
        `Seviye ${nextLevel} oldu`,
        "Yeni seviye ile birlikte yıldız bakiyen ve sezon vitrinin güçlendi.",
        "seviye",
        "/ana-menu",
      );
    }
  });

  return {
    earnedXp,
    nextLevel,
    levelUpCount,
  };
}

export async function claimDailyReward(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      progression: true,
      dailyRewards: {
        orderBy: {
          claimedAt: "desc",
        },
        take: 1,
      },
    },
  });

  const latest = user.dailyRewards[0];
  if (
    latest &&
    latest.claimedAt.toDateString() === new Date().toDateString()
  ) {
    throw new Error("Bugünün ödülü zaten alındı.");
  }

  const streak = (user.progression?.dailyStreak ?? 0) + 1;
  const rewardIndex = ((streak - 1) % dailyRewards.length) + 1;
  const reward = dailyRewards.find((entry) => entry.gun === rewardIndex);

  if (!reward) {
    throw new Error("Günlük ödül bulunamadı.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.dailyRewardClaim.create({
      data: {
        userId,
        dayIndex: reward.gun,
        xpAwarded: reward.xp,
        rewardId: reward.odulParca,
      },
    });

    await tx.userProgression.update({
      where: { userId },
      data: {
        xp: {
          increment: reward.xp,
        },
        dailyStreak: streak,
        lastRewardClaimAt: new Date(),
        nextDailyRewardAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    if (reward.odulParca) {
      await grantCosmetic(tx, userId, reward.odulParca);
    }

    await createNotification(
      tx,
      userId,
      `Günlük ödül alındı: ${reward.ad}`,
      `${reward.xp} XP hesabına işlendi.`,
      "gunluk-odul",
      "/gunluk-odul",
    );
  });

  return reward;
}

export async function ensureCatalogSeeded() {
  await prisma.cosmetic.createMany({
    data: cosmeticsCatalog.map((item) => ({
      id: item.id,
      category: item.kategori,
      name: item.ad,
      description: item.aciklama,
      rarity: item.rarity,
      unlockSource: item.kaynak,
      palette: item.palette as Prisma.InputJsonValue,
      glow: item.glow,
    })),
    skipDuplicates: true,
  });
}
