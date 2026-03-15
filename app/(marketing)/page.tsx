import Link from "next/link";
import { Crown, Shield, Sparkles, Swords, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";

const highlights = [
  {
    icon: Sparkles,
    title: "Premium his",
    text: "Katmanlı arka planlar, rafine glow sistemi ve duygusal ama ölçülü bir tasarım dili.",
  },
  {
    icon: Shield,
    title: "Gerçek üyelik",
    text: "Güvenli hesap, oturum, profil, doğrulama ve kalıcı progression akışları.",
  },
  {
    icon: Swords,
    title: "Canlı 1v1",
    text: "Özel oda, hızlı eşleşme, garbage akışı ve sonuç işleme omurgası.",
  },
  {
    icon: Trophy,
    title: "Turnuva sahnesi",
    text: "Kayıt, katılım, geçmiş ve genişlemeye uygun yarışma veri modeli.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-8 pb-12 pt-6">
      <Panel strong className="overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionTitle
              eyebrow="Lunara"
              title="Çizgilerin zarafeti, rekabetin sıcaklığı."
              description="Browser tabanlı blok düşürme deneyimini premium bir oyun platformuna dönüştüren, romantik alt tonlu ama rafine his veren tam kapsamlı merkez."
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/kayit-ol">
                <Button>Benzersiz hesabını oluştur</Button>
              </Link>
              <Link href="/giris-yap">
                <Button variant="ghost">Giriş yap</Button>
              </Link>
            </div>
          </div>
          <Panel className="p-6">
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-soft">Öne çıkan</p>
                <h2 className="mt-3 font-display text-4xl">Nocturne Kupası</h2>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Açılış sezonunun canlı 1v1 sahnesi. Hazır alanı, oda akışı ve sezon rozetleriyle öne çıkıyor.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-soft">100+</p>
                  <p className="mt-2 text-lg font-semibold">Seviye desteği</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-soft">1v1</p>
                  <p className="mt-2 text-lg font-semibold">Gerçek zamanlı düello</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <Panel key={item.title} className="p-6">
            <item.icon className="h-5 w-5 text-[var(--secondary)]" />
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-soft">İlk adım</p>
            <h2 className="mt-3 font-display text-4xl">Kendi profil kartını ve ritmini kur.</h2>
          </div>
          <Link href="/kayit-ol">
            <Button variant="ghost">
              <Crown className="h-4 w-4" />
              Profili başlat
            </Button>
          </Link>
        </div>
      </Panel>
    </div>
  );
}
