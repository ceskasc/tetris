export type GameModeId =
  | "klasik"
  | "rahat"
  | "zen"
  | "sprint"
  | "gorev"
  | "gunluk"
  | "duello";

export type Rarity = "saf" | "nadir" | "epik" | "efsane" | "gizli";

export type CosmeticCategory =
  | "blok-derisi"
  | "tahta-temasi"
  | "arka-plan"
  | "cizgi-efekti"
  | "isiltı-paketi"
  | "parcacik"
  | "arayuz"
  | "ses-paketi"
  | "avatar"
  | "cerceve"
  | "kart-susu";

export type QuestCategory =
  | "gunluk"
  | "haftalik"
  | "milestone"
  | "mod"
  | "online"
  | "turnuva"
  | "gizli";

export type AchievementCategory =
  | "baslangic"
  | "skor"
  | "combo"
  | "dayaniklilik"
  | "hiz"
  | "temiz-oyun"
  | "mod"
  | "gorev"
  | "koleksiyon"
  | "online"
  | "turnuva"
  | "gizli";

export type QuestDifficulty = "yumusak" | "ritmik" | "iddiali" | "zirve";

export type ThemeMode = "sistem" | "gece" | "aydinlik";

export type GraphicsDensity = "hafif" | "dengeli" | "yuksek";

export type TournamentStatus =
  | "yaklasiyor"
  | "kayit-acik"
  | "devam-ediyor"
  | "tamamlandi";

export interface ModeDefinition {
  id: GameModeId;
  ad: string;
  slogan: string;
  aciklama: string;
  vurgu: string;
  tempoEtiketi: string;
  odulCarpani: number;
  hedefler: string[];
  ozellikler: string[];
}

export interface CosmeticDefinition {
  id: string;
  kategori: CosmeticCategory;
  ad: string;
  aciklama: string;
  rarity: Rarity;
  kaynak: string;
  palette: string[];
  glow: string;
}

export interface QuestDefinition {
  id: string;
  kategori: QuestCategory;
  zorluk: QuestDifficulty;
  ad: string;
  aciklama: string;
  hedef: number;
  metric:
    | "satir"
    | "skor"
    | "combo"
    | "mac"
    | "online-galibiyet"
    | "perfect-clear"
    | "zaman"
    | "gorev";
  odulXp: number;
  odulParca?: string;
  nadirlik: Rarity;
  ikon: string;
}

export interface AchievementDefinition {
  id: string;
  kategori: AchievementCategory;
  ad: string;
  aciklama: string;
  hedef: number;
  metric:
    | "satir"
    | "skor"
    | "combo"
    | "perfect-clear"
    | "mac"
    | "online-galibiyet"
    | "turnuva"
    | "koleksiyon"
    | "gorev";
  rarity: Rarity;
  ikon: string;
  odulXp: number;
  odulParca?: string;
  gizli?: boolean;
}

export interface TournamentDefinition {
  id: string;
  slug: string;
  ad: string;
  altBaslik: string;
  aciklama: string;
  durum: TournamentStatus;
  format: string;
  sezon: string;
  baslangic: string;
  bitis: string;
  kayitKapanis: string;
  maxKatilimci: number;
  oduller: string[];
  kurallar: string[];
  vurguRenkleri: string[];
}

export interface ProgressionSnapshot {
  level: number;
  xp: number;
  nextLevelXp: number;
  prestige: number;
  stars: number;
  rankedPuan: number;
  gunlukSeri: number;
}

export interface QuestProgress {
  questId: string;
  ilerleme: number;
  tamamlandi: boolean;
  odulAlindi: boolean;
  sifirlanma?: string;
}

export interface AchievementProgress {
  achievementId: string;
  ilerleme: number;
  acildi: boolean;
  acilmaTarihi?: string;
}

export interface OwnedCosmetic {
  cosmeticId: string;
  acildi: string;
  secili: boolean;
  yeni: boolean;
  favori: boolean;
}

export interface StatisticsSummary {
  toplamMac: number;
  toplamDakika: number;
  toplamSkor: number;
  enYuksekSkor: number;
  temizlenenToplamSatir: number;
  enUzunCombo: number;
  perfectClearSayisi: number;
  ortalamaMacSuresi: number;
  ortalamaSkor: number;
  gunlukSeri: number;
  acilanOdulSayisi: number;
  basarimTamamlamaOrani: number;
  gorevTamamlamaOrani: number;
  favoriMod: GameModeId;
  onlineGalibiyet: number;
  onlineMaglubiyet: number;
  turnuvaKatilim: number;
  enIyiDerece?: number;
}

export interface ProfileSnapshot {
  kullaniciAdi: string;
  gorunenAd: string;
  unvan: string;
  bio: string;
  avatarRenk: string;
  seciliTema: string;
  seciliTahtaTemasi: string;
  seciliEfekt: string;
  sonBasarimlar: string[];
}

export interface UserSettingsSnapshot {
  temaModu: ThemeMode;
  temaPaketi: string;
  azaltIlkHareket: boolean;
  yuksekKontrast: boolean;
  grafikYogunlugu: GraphicsDensity;
  anaSes: number;
  muzikSes: number;
  efektSes: number;
  dokunmatikKontroller: boolean;
  bildirimler: boolean;
  titreSimdilik: boolean;
  tusAtamalari: Record<string, string>;
}

export interface GameSessionSummary {
  mod: GameModeId;
  skor: number;
  satir: number;
  sureMs: number;
  comboEnYuksek: number;
  level: number;
  perfectClear: number;
  backToBack: number;
  kazanilanXp: number;
  hatalar: number;
  sonuc?: "galibiyet" | "maglubiyet";
}

export interface DashboardSnapshot {
  progression: ProgressionSnapshot;
  profile: ProfileSnapshot;
  statistics: StatisticsSummary;
  questProgress: QuestProgress[];
  achievementProgress: AchievementProgress[];
  cosmetics: OwnedCosmetic[];
}

export interface DailyRewardDefinition {
  gun: number;
  ad: string;
  aciklama: string;
  xp: number;
  odulParca?: string;
}

export interface MenuItem {
  href: string;
  etiket: string;
  kisaltma: string;
  aciklama: string;
}

export interface MatchmakingRoomSnapshot {
  odaKodu: string;
  oyuncular: {
    id: string;
    ad: string;
    hazir: boolean;
    bagli: boolean;
  }[];
  durum: "bekleniyor" | "hazirlik" | "oyunda" | "tamamlandi";
  mod: GameModeId;
  enIyiKac: number;
}
