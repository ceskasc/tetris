import { Prisma } from "@prisma/client";

import { achievementDefinitions } from "@/data/achievements";
import { cosmeticsCatalog } from "@/data/cosmetics";
import { dailyRewards, questDefinitions } from "@/data/quests";
import { defaultSettings } from "@/data/showcase";
import { prisma } from "@/db/prisma";
import { exportSchema, type PersistenceExport } from "@/persistence/schema";

async function ensureCatalog() {
  await prisma.cosmetic.createMany({
    data: cosmeticsCatalog.map((item) => ({
      id: item.id,
      category: item.kategori,
      name: item.ad,
      description: item.aciklama,
      rarity: item.rarity,
      unlockSource: item.kaynak,
      palette: item.palette,
      glow: item.glow,
    })),
    skipDuplicates: true,
  });
}

function starterCosmetics(userId: string) {
  return cosmeticsCatalog
    .filter((item) => item.kaynak === "Başlangıç seti")
    .map((item) => ({
      userId,
      cosmeticId: item.id,
      isEquipped: item.id === "board-gece-cicegi" || item.id === "skin-silk",
      isFavorite: item.id === "board-gece-cicegi",
      isNew: false,
    }));
}

export async function exportUserData(userId: string): Promise<PersistenceExport> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      settings: true,
      progression: true,
      statistics: true,
      cosmetics: true,
      quests: true,
      achievements: true,
      dailyRewards: true,
      gameSessions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 60,
      },
    },
  });

  return exportSchema.parse({
    surum: 1,
    disaAktarimTarihi: new Date().toISOString(),
    profil: {
      gorunenAd: user.profile?.displayName ?? user.username,
      bio: user.profile?.bio ?? "",
      unvan: user.profile?.title ?? "Yeni Ritim",
      avatarRenk: user.profile?.avatarHue ?? "#f7b8e7",
      seciliTema: user.profile?.selectedThemeId ?? "gece-cicegi",
      seciliTahtaTemasi: user.profile?.selectedBoardSkinId ?? "board-gece-cicegi",
      seciliEfekt: user.profile?.selectedEffectId ?? "fx-ribbon",
      romanceSignature: user.profile?.romanceSignature ?? "Nazik ama kararlı.",
    },
    ayarlar: {
      temaModu: user.settings?.themeMode ?? defaultSettings.temaModu,
      temaPaketi: user.settings?.themePreset ?? defaultSettings.temaPaketi,
      azaltIlkHareket: user.settings?.reducedMotion ?? defaultSettings.azaltIlkHareket,
      yuksekKontrast: user.settings?.highContrast ?? defaultSettings.yuksekKontrast,
      grafikYogunlugu: user.settings?.graphicsDensity ?? defaultSettings.grafikYogunlugu,
      anaSes: user.settings?.masterVolume ?? defaultSettings.anaSes,
      muzikSes: user.settings?.musicVolume ?? defaultSettings.muzikSes,
      efektSes: user.settings?.sfxVolume ?? defaultSettings.efektSes,
      dokunmatikKontroller: user.settings?.touchControls ?? defaultSettings.dokunmatikKontroller,
      bildirimler: user.settings?.notificationsEnabled ?? defaultSettings.bildirimler,
      titreSimdilik: user.settings?.vibrationEnabled ?? defaultSettings.titreSimdilik,
      tusAtamalari: (user.settings?.keyBindings as Record<string, string> | null) ?? defaultSettings.tusAtamalari,
    },
    progression: {
      xp: user.progression?.xp ?? 0,
      level: user.progression?.level ?? 1,
      prestige: user.progression?.prestige ?? 0,
      stars: user.progression?.stars ?? 0,
      rankedPuan: user.progression?.rankedRating ?? 1000,
      gunlukSeri: user.progression?.dailyStreak ?? 0,
      modUstaligi: (user.progression?.modMastery as Record<string, unknown> | null) ?? {},
      milestoneDurumu: (user.progression?.milestoneState as Record<string, unknown> | null) ?? {},
    },
    istatistikler: {
      toplamMac: user.statistics?.totalMatches ?? 0,
      toplamDakika: user.statistics?.totalPlayMinutes ?? 0,
      toplamSkor: Number(user.statistics?.totalScore ?? 0),
      enYuksekSkor: user.statistics?.highScore ?? 0,
      temizlenenToplamSatir: user.statistics?.totalLines ?? 0,
      enUzunCombo: user.statistics?.longestCombo ?? 0,
      perfectClearSayisi: user.statistics?.perfectClearCount ?? 0,
      ortalamaMacSuresi: user.statistics?.averageMatchDurationMs ?? 0,
      ortalamaSkor: user.statistics?.averageScore ?? 0,
      gunlukSeri: user.statistics?.dailyStreak ?? 0,
      acilanOdulSayisi: user.statistics?.unlockedRewardCount ?? 0,
      basarimTamamlamaOrani: user.statistics?.achievementCompletionPct ?? 0,
      gorevTamamlamaOrani: user.statistics?.questCompletionPct ?? 0,
      favoriMod: user.statistics?.favoriteMode ?? "klasik",
      onlineGalibiyet: user.statistics?.onlineWins ?? 0,
      onlineMaglubiyet: user.statistics?.onlineLosses ?? 0,
      turnuvaKatilim: user.statistics?.tournamentsJoined ?? 0,
      enIyiDerece: user.statistics?.bestTournamentRank ?? null,
      modaGoreMaclar: (user.statistics?.gamesByMode as Record<string, number> | null) ?? {},
      temaKullanimi: (user.statistics?.themeUsage as Record<string, number> | null) ?? {},
    },
    kozmetikler: user.cosmetics.map((entry) => ({
      cosmeticId: entry.cosmeticId,
      unlockedAt: entry.unlockedAt.toISOString(),
      isEquipped: entry.isEquipped,
      isFavorite: entry.isFavorite,
      isNew: entry.isNew,
    })),
    gorevler: user.quests.map((entry) => ({
      questId: entry.questId,
      progress: entry.progress,
      goal: entry.goal,
      completed: entry.completed,
      claimedAt: entry.claimedAt?.toISOString() ?? null,
      resetsAt: entry.resetsAt?.toISOString() ?? null,
    })),
    basarimlar: user.achievements.map((entry) => ({
      achievementId: entry.achievementId,
      progress: entry.progress,
      goal: entry.goal,
      unlockedAt: entry.unlockedAt?.toISOString() ?? null,
      claimedAt: entry.claimedAt?.toISOString() ?? null,
    })),
    gunlukOduller: user.dailyRewards.map((entry) => ({
      dayIndex: entry.dayIndex,
      xpAwarded: entry.xpAwarded,
      rewardId: entry.rewardId ?? null,
      claimedAt: entry.claimedAt.toISOString(),
    })),
    oyunOturumlari: user.gameSessions.map((entry) => ({
      mode: entry.mode,
      startedAt: entry.startedAt.toISOString(),
      endedAt: entry.endedAt.toISOString(),
      score: entry.score,
      lines: entry.lines,
      level: entry.level,
      comboMax: entry.comboMax,
      perfectClears: entry.perfectClears,
      durationMs: entry.durationMs,
      metadata: (entry.metadata as Record<string, unknown> | null) ?? {},
    })),
  });
}

async function replaceUserProgressData(
  tx: Prisma.TransactionClient,
  userId: string,
  data: PersistenceExport,
) {
  await tx.userCosmetic.deleteMany({ where: { userId } });
  await tx.userQuestProgress.deleteMany({ where: { userId } });
  await tx.userAchievementProgress.deleteMany({ where: { userId } });
  await tx.dailyRewardClaim.deleteMany({ where: { userId } });
  await tx.gameSession.deleteMany({ where: { userId } });

  await tx.profile.update({
    where: { userId },
    data: {
      displayName: data.profil.gorunenAd,
      bio: data.profil.bio,
      title: data.profil.unvan,
      avatarHue: data.profil.avatarRenk,
      selectedThemeId: data.profil.seciliTema,
      selectedBoardSkinId: data.profil.seciliTahtaTemasi,
      selectedEffectId: data.profil.seciliEfekt,
      romanceSignature: data.profil.romanceSignature ?? "Nazik ama kararlı.",
    },
  });

  await tx.userSettings.update({
    where: { userId },
    data: {
      themeMode: data.ayarlar.temaModu,
      themePreset: data.ayarlar.temaPaketi,
      reducedMotion: data.ayarlar.azaltIlkHareket,
      highContrast: data.ayarlar.yuksekKontrast,
      graphicsDensity: data.ayarlar.grafikYogunlugu,
      masterVolume: data.ayarlar.anaSes,
      musicVolume: data.ayarlar.muzikSes,
      sfxVolume: data.ayarlar.efektSes,
      touchControls: data.ayarlar.dokunmatikKontroller,
      notificationsEnabled: data.ayarlar.bildirimler,
      vibrationEnabled: data.ayarlar.titreSimdilik,
      keyBindings: data.ayarlar.tusAtamalari,
    },
  });

  await tx.userProgression.update({
    where: { userId },
    data: {
      xp: data.progression.xp,
      level: data.progression.level,
      prestige: data.progression.prestige,
      stars: data.progression.stars,
      rankedRating: data.progression.rankedPuan,
      dailyStreak: data.progression.gunlukSeri,
      modMastery: data.progression.modUstaligi as Prisma.InputJsonValue,
      milestoneState: data.progression.milestoneDurumu as Prisma.InputJsonValue,
    },
  });

  await tx.userStatistics.update({
    where: { userId },
    data: {
      totalMatches: data.istatistikler.toplamMac,
      totalPlayMinutes: data.istatistikler.toplamDakika,
      totalScore: BigInt(data.istatistikler.toplamSkor),
      highScore: data.istatistikler.enYuksekSkor,
      totalLines: data.istatistikler.temizlenenToplamSatir,
      longestCombo: data.istatistikler.enUzunCombo,
      perfectClearCount: data.istatistikler.perfectClearSayisi,
      averageMatchDurationMs: data.istatistikler.ortalamaMacSuresi,
      averageScore: data.istatistikler.ortalamaSkor,
      dailyStreak: data.istatistikler.gunlukSeri,
      unlockedRewardCount: data.istatistikler.acilanOdulSayisi,
      achievementCompletionPct: data.istatistikler.basarimTamamlamaOrani,
      questCompletionPct: data.istatistikler.gorevTamamlamaOrani,
      favoriteMode: data.istatistikler.favoriMod,
      onlineWins: data.istatistikler.onlineGalibiyet,
      onlineLosses: data.istatistikler.onlineMaglubiyet,
      tournamentsJoined: data.istatistikler.turnuvaKatilim,
      bestTournamentRank: data.istatistikler.enIyiDerece ?? null,
      gamesByMode: data.istatistikler.modaGoreMaclar,
      themeUsage: data.istatistikler.temaKullanimi,
    },
  });

  if (data.kozmetikler.length) {
    await tx.userCosmetic.createMany({
      data: data.kozmetikler.map((entry) => ({
        userId,
        cosmeticId: entry.cosmeticId,
        unlockedAt: new Date(entry.unlockedAt),
        isEquipped: entry.isEquipped,
        isFavorite: entry.isFavorite,
        isNew: entry.isNew,
      })),
      skipDuplicates: true,
    });
  }

  if (data.gorevler.length) {
    await tx.userQuestProgress.createMany({
      data: data.gorevler.map((entry) => ({
        userId,
        questId: entry.questId,
        progress: entry.progress,
        goal: entry.goal,
        completed: entry.completed,
        claimedAt: entry.claimedAt ? new Date(entry.claimedAt) : null,
        resetsAt: entry.resetsAt ? new Date(entry.resetsAt) : null,
      })),
      skipDuplicates: true,
    });
  }

  if (data.basarimlar.length) {
    await tx.userAchievementProgress.createMany({
      data: data.basarimlar.map((entry) => ({
        userId,
        achievementId: entry.achievementId,
        progress: entry.progress,
        goal: entry.goal,
        unlockedAt: entry.unlockedAt ? new Date(entry.unlockedAt) : null,
        claimedAt: entry.claimedAt ? new Date(entry.claimedAt) : null,
      })),
      skipDuplicates: true,
    });
  }

  if (data.gunlukOduller.length) {
    await tx.dailyRewardClaim.createMany({
      data: data.gunlukOduller.map((entry) => ({
        userId,
        dayIndex: entry.dayIndex,
        xpAwarded: entry.xpAwarded,
        rewardId: entry.rewardId ?? null,
        claimedAt: new Date(entry.claimedAt),
      })),
      skipDuplicates: true,
    });
  }

  if (data.oyunOturumlari.length) {
    await tx.gameSession.createMany({
      data: data.oyunOturumlari.map((entry) => ({
        userId,
        mode: entry.mode,
        startedAt: new Date(entry.startedAt),
        endedAt: new Date(entry.endedAt),
        score: entry.score,
        lines: entry.lines,
        level: entry.level,
        comboMax: entry.comboMax,
        perfectClears: entry.perfectClears,
        durationMs: entry.durationMs,
        metadata: entry.metadata as Prisma.InputJsonValue,
      })),
      skipDuplicates: false,
    });
  }
}

export async function importUserData(userId: string, rawData: unknown) {
  await ensureCatalog();
  const data = exportSchema.parse(rawData);

  await prisma.$transaction(async (tx) => {
    await replaceUserProgressData(tx, userId, data);
    await tx.notification.create({
      data: {
        userId,
        title: "Bulut kaydı içe aktarıldı",
        body: "Profil, progression ve kayıtlı seansların yeni verilerle yenilendi.",
        type: "veri-yonetimi",
        actionUrl: "/hesap",
      },
    });
  });
}

export async function resetUserProgress(userId: string) {
  await ensureCatalog();

  await prisma.$transaction(async (tx) => {
    await tx.userCosmetic.deleteMany({ where: { userId } });
    await tx.userQuestProgress.deleteMany({ where: { userId } });
    await tx.userAchievementProgress.deleteMany({ where: { userId } });
    await tx.gameSession.deleteMany({ where: { userId } });
    await tx.dailyRewardClaim.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({
      where: {
        userId,
        type: "veri-yonetimi",
      },
    });

    await tx.userProgression.update({
      where: { userId },
      data: {
        xp: 0,
        level: 1,
        prestige: 0,
        stars: 0,
        rankedRating: 1000,
        dailyStreak: 0,
        nextDailyRewardAt: null,
        lastRewardClaimAt: null,
        modMastery: {},
        milestoneState: {},
      },
    });

    await tx.userStatistics.update({
      where: { userId },
      data: {
        totalMatches: 0,
        totalPlayMinutes: 0,
        totalScore: BigInt(0),
        highScore: 0,
        totalLines: 0,
        longestCombo: 0,
        perfectClearCount: 0,
        averageMatchDurationMs: 0,
        averageScore: 0,
        dailyStreak: 0,
        unlockedRewardCount: 0,
        achievementCompletionPct: 0,
        questCompletionPct: 0,
        favoriteMode: "klasik",
        onlineWins: 0,
        onlineLosses: 0,
        tournamentsJoined: 0,
        bestTournamentRank: null,
        gamesByMode: {},
        themeUsage: {},
      },
    });

    await tx.userCosmetic.createMany({
      data: starterCosmetics(userId),
      skipDuplicates: true,
    });

    await tx.userQuestProgress.createMany({
      data: questDefinitions.map((quest) => ({
        userId,
        questId: quest.id,
        goal: quest.hedef,
        progress: 0,
        completed: false,
      })),
      skipDuplicates: true,
    });

    await tx.userAchievementProgress.createMany({
      data: achievementDefinitions.map((achievement) => ({
        userId,
        achievementId: achievement.id,
        goal: achievement.hedef,
        progress: 0,
      })),
      skipDuplicates: true,
    });

    await tx.notification.create({
      data: {
        userId,
        title: "İlerleme sıfırlandı",
        body: "Hesabın korundu, ancak oyun içi ilerleme ve kayıtlı seanslar temizlendi.",
        type: "veri-yonetimi",
        actionUrl: "/hesap",
      },
    });
  });
}

export function getNextDailyRewardPreview(streak: number) {
  const rewardIndex = (streak % dailyRewards.length) + 1;
  return dailyRewards.find((entry) => entry.gun === rewardIndex) ?? dailyRewards[0];
}
