import type {
  AchievementProgress,
  DashboardSnapshot,
  OwnedCosmetic,
  ProfileSnapshot,
  ProgressionSnapshot,
  QuestProgress,
  StatisticsSummary,
  UserSettingsSnapshot,
} from "@/types";

export const defaultProgression: ProgressionSnapshot = {
  level: 18,
  xp: 3840,
  nextLevelXp: 4420,
  prestige: 0,
  stars: 12,
  rankedPuan: 1215,
  gunlukSeri: 6,
};

export const defaultProfile: ProfileSnapshot = {
  kullaniciAdi: "ayisigi",
  gorunenAd: "Ay Işığı",
  unvan: "Gece Çiçeği",
  bio: "Ritmini sakin kurup kritik anlarda parlayan oyuncu kartı.",
  avatarRenk: "#f7b8e7",
  seciliTema: "gece-cicegi",
  seciliTahtaTemasi: "board-gece-cicegi",
  seciliEfekt: "fx-ribbon",
  sonBasarimlar: ["combo-10", "perfect-clear-3", "tournament-entry"],
};

export const defaultStatistics: StatisticsSummary = {
  toplamMac: 184,
  toplamDakika: 1420,
  toplamSkor: 9684300,
  enYuksekSkor: 198420,
  temizlenenToplamSatir: 6842,
  enUzunCombo: 11,
  perfectClearSayisi: 6,
  ortalamaMacSuresi: 463000,
  ortalamaSkor: 52630,
  gunlukSeri: 6,
  acilanOdulSayisi: 14,
  basarimTamamlamaOrani: 48,
  gorevTamamlamaOrani: 61,
  favoriMod: "klasik",
  onlineGalibiyet: 22,
  onlineMaglubiyet: 11,
  turnuvaKatilim: 3,
  enIyiDerece: 4,
};

export const defaultQuestProgress: QuestProgress[] = [
  { questId: "daily-lines-24", ilerleme: 18, tamamlandi: false, odulAlindi: false },
  { questId: "daily-score-50k", ilerleme: 50000, tamamlandi: true, odulAlindi: false },
  { questId: "daily-combo-6", ilerleme: 4, tamamlandi: false, odulAlindi: false },
  { questId: "weekly-online-3", ilerleme: 2, tamamlandi: false, odulAlindi: false },
  { questId: "weekly-perfect-clear", ilerleme: 1, tamamlandi: false, odulAlindi: false },
  { questId: "milestone-100-matches", ilerleme: 100, tamamlandi: true, odulAlindi: true },
  { questId: "mode-zen-time", ilerleme: 420000, tamamlandi: false, odulAlindi: false },
  { questId: "tournament-entry", ilerleme: 1, tamamlandi: true, odulAlindi: false },
];

export const defaultAchievementProgress: AchievementProgress[] = [
  { achievementId: "first-drop", ilerleme: 1, acildi: true, acilmaTarihi: "2026-03-01T19:12:00+03:00" },
  { achievementId: "score-100k", ilerleme: 100000, acildi: true, acilmaTarihi: "2026-03-04T21:10:00+03:00" },
  { achievementId: "combo-10", ilerleme: 10, acildi: true, acilmaTarihi: "2026-03-11T20:45:00+03:00" },
  { achievementId: "perfect-clear-3", ilerleme: 2, acildi: false },
  { achievementId: "matches-250", ilerleme: 184, acildi: false },
  { achievementId: "sprint-sub-2m", ilerleme: 0, acildi: false },
  { achievementId: "online-10", ilerleme: 10, acildi: true, acilmaTarihi: "2026-03-14T23:17:00+03:00" },
  { achievementId: "tournament-entry", ilerleme: 1, acildi: true, acilmaTarihi: "2026-03-10T18:15:00+03:00" },
  { achievementId: "collect-8", ilerleme: 7, acildi: false },
  { achievementId: "hidden-vow", ilerleme: 0, acildi: false },
];

export const defaultOwnedCosmetics: OwnedCosmetic[] = [
  { cosmeticId: "board-gece-cicegi", acildi: "2026-03-01T10:00:00+03:00", secili: true, yeni: false, favori: true },
  { cosmeticId: "skin-silk", acildi: "2026-03-01T10:00:00+03:00", secili: true, yeni: false, favori: true },
  { cosmeticId: "fx-ribbon", acildi: "2026-03-12T20:10:00+03:00", secili: true, yeni: true, favori: false },
  { cosmeticId: "ui-lace", acildi: "2026-03-09T18:40:00+03:00", secili: false, yeni: false, favori: true },
  { cosmeticId: "avatar-aurora", acildi: "2026-03-13T19:30:00+03:00", secili: false, yeni: true, favori: false },
  { cosmeticId: "board-amber-echo", acildi: "2026-03-15T12:30:00+03:00", secili: false, yeni: true, favori: false },
  { cosmeticId: "skin-velour", acildi: "2026-03-14T17:25:00+03:00", secili: false, yeni: true, favori: true },
];

export const defaultSettings: UserSettingsSnapshot = {
  temaModu: "gece",
  temaPaketi: "gece-cicegi",
  azaltIlkHareket: false,
  yuksekKontrast: false,
  grafikYogunlugu: "yuksek",
  anaSes: 82,
  muzikSes: 58,
  efektSes: 76,
  dokunmatikKontroller: true,
  bildirimler: true,
  titreSimdilik: false,
  tusAtamalari: {
    sola: "ArrowLeft",
    saga: "ArrowRight",
    yumusakBirak: "ArrowDown",
    sertBirak: "Space",
    saatYonunde: "ArrowUp",
    tersYon: "KeyZ",
    beklet: "ShiftLeft",
    duraklat: "Escape",
  },
};

export const showcaseDashboard: DashboardSnapshot = {
  progression: defaultProgression,
  profile: defaultProfile,
  statistics: defaultStatistics,
  questProgress: defaultQuestProgress,
  achievementProgress: defaultAchievementProgress,
  cosmetics: defaultOwnedCosmetics,
};
