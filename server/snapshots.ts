import { Prisma } from "@prisma/client";

import { defaultSettings, showcaseDashboard } from "@/data/showcase";
import type {
  DashboardSnapshot,
  GameModeId,
  ProfileSnapshot,
  UserSettingsSnapshot,
} from "@/types";

export type SessionUser = Prisma.UserGetPayload<{
  include: {
    profile: true;
    progression: true;
    settings: true;
    statistics: true;
    cosmetics: true;
    achievements: true;
    quests: true;
  };
}>;

export function toProfileSnapshot(user: SessionUser): ProfileSnapshot {
  return {
    kullaniciAdi: user.username,
    gorunenAd: user.profile?.displayName ?? user.username,
    unvan: user.profile?.title ?? "Yeni Ritim",
    bio: user.profile?.bio ?? "",
    avatarRenk: user.profile?.avatarHue ?? "#f7b8e7",
    seciliTema: user.profile?.selectedThemeId ?? "gece-cicegi",
    seciliTahtaTemasi:
      user.profile?.selectedBoardSkinId ?? "board-gece-cicegi",
    seciliEfekt: user.profile?.selectedEffectId ?? "fx-ribbon",
    sonBasarimlar: user.achievements
      .filter((entry) => Boolean(entry.unlockedAt))
      .sort(
        (left, right) =>
          new Date(right.unlockedAt ?? 0).getTime() -
          new Date(left.unlockedAt ?? 0).getTime(),
      )
      .slice(0, 3)
      .map((entry) => entry.achievementId),
  };
}

export function toSettingsSnapshot(user: SessionUser): UserSettingsSnapshot {
  return {
    temaModu: (user.settings?.themeMode as UserSettingsSnapshot["temaModu"]) ??
      defaultSettings.temaModu,
    temaPaketi: user.settings?.themePreset ?? defaultSettings.temaPaketi,
    azaltIlkHareket:
      user.settings?.reducedMotion ?? defaultSettings.azaltIlkHareket,
    yuksekKontrast:
      user.settings?.highContrast ?? defaultSettings.yuksekKontrast,
    grafikYogunlugu:
      (user.settings?.graphicsDensity as UserSettingsSnapshot["grafikYogunlugu"]) ??
      defaultSettings.grafikYogunlugu,
    anaSes: user.settings?.masterVolume ?? defaultSettings.anaSes,
    muzikSes: user.settings?.musicVolume ?? defaultSettings.muzikSes,
    efektSes: user.settings?.sfxVolume ?? defaultSettings.efektSes,
    dokunmatikKontroller:
      user.settings?.touchControls ?? defaultSettings.dokunmatikKontroller,
    bildirimler:
      user.settings?.notificationsEnabled ?? defaultSettings.bildirimler,
    titreSimdilik:
      user.settings?.vibrationEnabled ?? defaultSettings.titreSimdilik,
    tusAtamalari:
      (user.settings?.keyBindings as Record<string, string> | null) ??
      defaultSettings.tusAtamalari,
  };
}

export function toDashboardSnapshot(user?: SessionUser | null): DashboardSnapshot {
  if (!user) {
    return showcaseDashboard;
  }

  return {
    progression: {
      level: user.progression?.level ?? 1,
      xp: user.progression?.xp ?? 0,
      nextLevelXp: user.progression?.xp ? user.progression.xp + 400 : 400,
      prestige: user.progression?.prestige ?? 0,
      stars: user.progression?.stars ?? 0,
      rankedPuan: user.progression?.rankedRating ?? 1000,
      gunlukSeri: user.progression?.dailyStreak ?? 0,
    },
    profile: toProfileSnapshot(user),
    statistics: {
      toplamMac: user.statistics?.totalMatches ?? 0,
      toplamDakika: user.statistics?.totalPlayMinutes ?? 0,
      toplamSkor: Number(user.statistics?.totalScore ?? 0n),
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
      favoriMod:
        (user.statistics?.favoriteMode as GameModeId | undefined) ?? "klasik",
      onlineGalibiyet: user.statistics?.onlineWins ?? 0,
      onlineMaglubiyet: user.statistics?.onlineLosses ?? 0,
      turnuvaKatilim: user.statistics?.tournamentsJoined ?? 0,
      enIyiDerece: user.statistics?.bestTournamentRank ?? undefined,
    },
    questProgress: user.quests.map((entry) => ({
      questId: entry.questId,
      ilerleme: entry.progress,
      tamamlandi: entry.completed,
      odulAlindi: Boolean(entry.claimedAt),
      sifirlanma: entry.resetsAt?.toISOString(),
    })),
    achievementProgress: user.achievements.map((entry) => ({
      achievementId: entry.achievementId,
      ilerleme: entry.progress,
      acildi: Boolean(entry.unlockedAt),
      acilmaTarihi: entry.unlockedAt?.toISOString(),
    })),
    cosmetics: user.cosmetics.map((entry) => ({
      cosmeticId: entry.cosmeticId,
      acildi: entry.unlockedAt.toISOString(),
      secili: entry.isEquipped,
      yeni: entry.isNew,
      favori: entry.isFavorite,
    })),
  };
}
