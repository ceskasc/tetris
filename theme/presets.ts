export const themePresets = {
  "gece-cicegi": {
    ad: "Gece Çiçeği",
    aciklama:
      "Derin morlar, sıcak lila geçişleri ve zarif ışık halkalarıyla sakin ama iddialı bir atmosfer.",
    sinif: "theme-gece-cicegi",
  },
  "kutup-isiltisi": {
    ad: "Kutup Işıltısı",
    aciklama:
      "Dingin mavi parıltılar, ipeksi paneller ve temiz beyaz vurgularla ferah bir premium düzen.",
    sinif: "theme-kutup-isiltisi",
  },
  "amber-gecesi": {
    ad: "Amber Gecesi",
    aciklama:
      "Koyu gece zemini üzerinde altın-somon kırılmalarıyla rafine ve duygusal bir sıcaklık.",
    sinif: "theme-amber-gecesi",
  },
} as const;

export type ThemePresetId = keyof typeof themePresets;
