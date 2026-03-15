import type { ModeDefinition } from "@/types";

export const modeDefinitions: ModeDefinition[] = [
  {
    id: "klasik",
    ad: "Klasik Sonsuz",
    slogan: "Ritmi kur, tempoyu büyüt, çizgileri ipeksi bir akışla erit.",
    aciklama:
      "Ana mod. Hız her seviyede belirginleşir, hata affı azalır, yüksek skor ve ustalık hissi merkezde kalır.",
    vurgu: "Skor avı, back-to-back zinciri ve uzun seans doyumu.",
    tempoEtiketi: "Yükselen tempo",
    odulCarpani: 1.25,
    hedefler: ["Yüksek skor", "Seviye ivmesi", "Koleksiyon açılımı"],
    ozellikler: ["Tam progression etkisi", "En yüksek tekrar oynanabilirlik", "Streak odaklı"],
  },
  {
    id: "rahat",
    ad: "Rahat Mod",
    slogan: "Baskıyı azalt, estetiği büyüt, uzun seanslara yumuşak bir ritim ver.",
    aciklama:
      "Daha affedici hız eğrisi ve uzun lock delay ile giriş dostu ama tatmin seviyesi yüksek bir deneyim sunar.",
    vurgu: "Yumuşak tempo, hatasız akış ve sakin progression.",
    tempoEtiketi: "Dengeli tempo",
    odulCarpani: 1,
    hedefler: ["Uzun ömürlü seans", "Az hata", "Seri koruma"],
    ozellikler: ["Geniş lock delay", "Daha sakin hız", "Yeni oyuncuya dost"],
  },
  {
    id: "zen",
    ad: "Zen Akışı",
    slogan: "Ambiyans öne çıksın, seans zihni berraklaştırsın.",
    aciklama:
      "Meditatif sesler, daha ağır hız skalası ve düşük cezalandırma ile stres azaltıcı bir blok akışı kurar.",
    vurgu: "Rahatlatıcı ritim ve atmosfer odaklı oynanış.",
    tempoEtiketi: "Meditatif tempo",
    odulCarpani: 0.9,
    hedefler: ["Odaklanma", "Uzun kombinasyon", "Sakin tekrar"],
    ozellikler: ["Yumuşak görsel ton", "Combo kutlamaları", "Düşük baskı"],
  },
  {
    id: "sprint",
    ad: "Sprint 40",
    slogan: "Kırk çizgiyi en kısa sürede erit, verimliliğini ölç.",
    aciklama:
      "Süre ve temiz karar kalitesini öne çıkaran hız sınavı. Her hareket ölçülür, her duraksama görünür olur.",
    vurgu: "Hız, doğruluk ve giriş kalitesi gösterimi.",
    tempoEtiketi: "Rekabetçi tempo",
    odulCarpani: 1.4,
    hedefler: ["En iyi süre", "Hatasız rota", "Verimlilik"],
    ozellikler: ["40 çizgi hedefi", "Süre odaklı", "Liderlik potansiyeli"],
  },
  {
    id: "gorev",
    ad: "Görev Seansı",
    slogan: "Her seferinde başka bir hedef, başka bir tatmin eğrisi.",
    aciklama:
      "Belirli skor, combo, çizgi, hayatta kalma ve blok verimliliği hedefleriyle tasarlanmış seanslar.",
    vurgu: "Net hedefler ve güçlü ödül bağlantısı.",
    tempoEtiketi: "Hedef odaklı",
    odulCarpani: 1.3,
    hedefler: ["Görev zinciri", "XP patlaması", "Koleksiyon ilerleme"],
    ozellikler: ["Dinamik hedefler", "Mini kutlama", "Günlük rotasyon"],
  },
  {
    id: "gunluk",
    ad: "Günlük Challenge",
    slogan: "Her gün aynı tohum, bambaşka ustalık karşılaştırması.",
    aciklama:
      "Deterministik günlük görev yapısı ile herkese aynı başlangıç verilir; skor ve verim daha anlamlı hale gelir.",
    vurgu: "Her gün geri dönüş motivasyonu ve adil karşılaştırma.",
    tempoEtiketi: "Günlük ritim",
    odulCarpani: 1.5,
    hedefler: ["Günlük giriş", "Seri koruma", "Özel ödül"],
    ozellikler: ["Deterministik tohum", "Günlük liderlik", "Seri bonusu"],
  },
  {
    id: "duello",
    ad: "Online Düello",
    slogan: "Akıcı garbage akışı, gerçek tempo savaşı, net sonuç duygusu.",
    aciklama:
      "Gerçek zamanlı 1v1 mod. Hazırlık, maç başlangıcı, garbage gönderimi, sonuç ve yeniden eşleşme akışı birlikte çalışır.",
    vurgu: "Rekabetçi adrenalin ve adil ritim dengesi.",
    tempoEtiketi: "Canlı rekabet",
    odulCarpani: 1.6,
    hedefler: ["Galibiyet", "Puan", "Turnuva hazırlığı"],
    ozellikler: ["Gerçek zamanlı", "Oda sistemi", "Bağlantı durumu"],
  },
];
