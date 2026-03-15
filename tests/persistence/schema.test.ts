import { describe, expect, it } from "vitest";

import { exportSchema } from "@/persistence/schema";

describe("kayıt şeması", () => {
  it("geçerli dışa aktarma verisini doğrular", () => {
    const parsed = exportSchema.parse({
      surum: 1,
      disaAktarimTarihi: new Date().toISOString(),
      profil: {
        gorunenAd: "Ay Işığı",
        bio: "",
        unvan: "Gece Çiçeği",
        avatarRenk: "#fff",
        seciliTema: "gece-cicegi",
        seciliTahtaTemasi: "board-gece-cicegi",
        seciliEfekt: "fx-ribbon",
      },
      ayarlar: {
        temaModu: "gece",
        temaPaketi: "gece-cicegi",
        azaltIlkHareket: false,
        yuksekKontrast: false,
        grafikYogunlugu: "yuksek",
        anaSes: 80,
        muzikSes: 60,
        efektSes: 70,
        dokunmatikKontroller: true,
        bildirimler: true,
        titreSimdilik: false,
        tusAtamalari: {},
      },
      progression: {
        xp: 0,
        level: 1,
        prestige: 0,
        stars: 0,
        rankedPuan: 1000,
        gunlukSeri: 0,
        modUstaligi: {},
        milestoneDurumu: {},
      },
      istatistikler: {
        toplamMac: 0,
        toplamDakika: 0,
        toplamSkor: 0,
        enYuksekSkor: 0,
        temizlenenToplamSatir: 0,
        enUzunCombo: 0,
        perfectClearSayisi: 0,
        ortalamaMacSuresi: 0,
        ortalamaSkor: 0,
        gunlukSeri: 0,
        acilanOdulSayisi: 0,
        basarimTamamlamaOrani: 0,
        gorevTamamlamaOrani: 0,
        favoriMod: "klasik",
        onlineGalibiyet: 0,
        onlineMaglubiyet: 0,
        turnuvaKatilim: 0,
        modaGoreMaclar: {},
        temaKullanimi: {},
      },
      kozmetikler: [],
      gorevler: [],
      basarimlar: [],
      gunlukOduller: [],
      oyunOturumlari: [],
    });

    expect(parsed.surum).toBe(1);
  });
});
