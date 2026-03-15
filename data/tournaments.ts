import type { TournamentDefinition } from "@/types";

export const tournamentDefinitions: TournamentDefinition[] = [
  {
    id: "season-opening-nocturne",
    slug: "sezon-acilisi-nocturne-kupasi",
    ad: "Nocturne Kupası",
    altBaslik: "Açılış sezonunun zarif ama rekabetçi düello sahnesi",
    aciklama:
      "İlk sezonun öne çıkan 1v1 tablosu. Kısa seri maçlar, hızlı eşleşme ve premium kozmetik ödülleriyle öne çıkar.",
    durum: "kayit-acik",
    format: "Tek eleme / En iyi 3",
    sezon: "Birinci Sezon",
    baslangic: "2026-03-22T18:00:00+03:00",
    bitis: "2026-03-22T22:00:00+03:00",
    kayitKapanis: "2026-03-22T16:30:00+03:00",
    maxKatilimci: 64,
    oduller: [
      "Aurora Portresi avatarı",
      "850 turnuva XP",
      "İlk 8 için özel profil rozeti",
    ],
    kurallar: [
      "Bağlantı doğrulaması öncesi hazır durumu zorunludur.",
      "Her raund 90 saniyelik hazırlık penceresi ile başlar.",
      "Bağlantı kopması durumunda 60 saniyelik yeniden bağlanma koruması vardır.",
    ],
    vurguRenkleri: ["#6f5cff", "#f3b2df", "#8bc8ff"],
  },
  {
    id: "sprint-salon-series",
    slug: "sprint-salon-serisi",
    ad: "Sprint Salon Serisi",
    altBaslik: "Süre odaklı seçkin salon yarışması",
    aciklama:
      "Sprint 40 odaklı puan tablosu yarışı. Belirli zaman aralığında en iyi dereceyi çıkaran oyuncular öne geçer.",
    durum: "yaklasiyor",
    format: "Puan tablosu / En iyi derece",
    sezon: "Birinci Sezon",
    baslangic: "2026-03-28T20:00:00+03:00",
    bitis: "2026-03-28T22:30:00+03:00",
    kayitKapanis: "2026-03-28T19:30:00+03:00",
    maxKatilimci: 120,
    oduller: [
      "Velur Doku blok derisi",
      "700 XP",
      "İlk 3 için özel kart süsü",
    ],
    kurallar: [
      "Her oyuncunun 5 resmi deneme hakkı vardır.",
      "En iyi tek derece sıralamaya işlenir.",
      "Aynı süre durumunda daha yüksek verim puanı öne çıkar.",
    ],
    vurguRenkleri: ["#1ab8ff", "#8ce2ff", "#fef0ff"],
  },
  {
    id: "zen-evening-gala",
    slug: "zen-aksami-galasi",
    ad: "Zen Akşamı Galası",
    altBaslik: "Düşük baskı, yüksek stil, koleksiyon odaklı topluluk etkinliği",
    aciklama:
      "Daha sakin bir topluluk gecesi. Uzun hayatta kalma ve estetik skor kombinasyonu üzerinden sezonluk rozetler dağıtılır.",
    durum: "devam-ediyor",
    format: "Süreli puan tablosu",
    sezon: "Birinci Sezon",
    baslangic: "2026-03-15T19:00:00+03:00",
    bitis: "2026-03-16T01:00:00+03:00",
    kayitKapanis: "2026-03-15T22:00:00+03:00",
    maxKatilimci: 250,
    oduller: [
      "Gece Çiçeği kart süsü",
      "500 XP",
      "Katılım rozeti",
    ],
    kurallar: [
      "Zen modunda geçirilen süre ve çizgi verimi birlikte değerlendirilir.",
      "Düşük hata oranı ek puan getirir.",
      "Etkinlik sonunda ilk 25 oyuncuya özel vitrin etiketi verilir.",
    ],
    vurguRenkleri: ["#ffb8d5", "#c8a2ff", "#8fa8ff"],
  },
];
