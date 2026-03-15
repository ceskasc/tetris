import { routes } from "@/constants/routes";
import type { MenuItem } from "@/types";

export const mainNavigation: MenuItem[] = [
  {
    href: routes.home,
    etiket: "Ana Menü",
    kisaltma: "01",
    aciklama: "Bugünün ritmini, son ilerlemeni ve öne çıkan ödülleri gör.",
  },
  {
    href: routes.modes,
    etiket: "Modlar",
    kisaltma: "02",
    aciklama: "Klasik, rahat, zen, sprint ve hedef odaklı akışlar arasında geçiş yap.",
  },
  {
    href: routes.online,
    etiket: "Online Maç",
    kisaltma: "03",
    aciklama: "Gerçek zamanlı 1v1 eşleş, özel oda kur ya da hazır odalara katıl.",
  },
  {
    href: routes.tournaments,
    etiket: "Turnuvalar",
    kisaltma: "04",
    aciklama: "Yaklaşan yarışmaları incele, kaydol ve sezonluk rekabete katıl.",
  },
  {
    href: routes.quests,
    etiket: "Görevler",
    kisaltma: "05",
    aciklama: "Günlük, haftalık ve gizli hedeflerle ritmi diri tut.",
  },
  {
    href: routes.achievements,
    etiket: "Başarımlar",
    kisaltma: "06",
    aciklama: "Koleksiyon ve ustalık odaklı kilometre taşlarını takip et.",
  },
  {
    href: routes.collection,
    etiket: "Koleksiyon",
    kisaltma: "07",
    aciklama: "Tahta temaları, blok derileri ve özel kart süslerini kuşan.",
  },
  {
    href: routes.profile,
    etiket: "Profil",
    kisaltma: "08",
    aciklama: "Oyuncu kartını, kozmetik kombinasyonlarını ve turnuva izlerini göster.",
  },
  {
    href: routes.statistics,
    etiket: "İstatistikler",
    kisaltma: "09",
    aciklama: "Seans ritmini, verim grafiğini ve mod bazlı ustalığını incele.",
  },
  {
    href: routes.settings,
    etiket: "Ayarlar",
    kisaltma: "10",
    aciklama: "Kontrolleri, ses paketlerini, erişilebilirlik ve güvenlik tercihini ayarla.",
  },
  {
    href: routes.account,
    etiket: "Hesap",
    kisaltma: "11",
    aciklama: "Oturumlar, parola güvenliği ve kayıt yönetimi akışlarını kontrol et.",
  },
];
