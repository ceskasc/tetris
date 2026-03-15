import { getCurrentDashboard } from "@/server/current-user";
import { ProfileEditor } from "@/features/profile/profile-editor";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";
import { StatCard } from "@/components/ui/stat-card";

export default async function ProfilePage() {
  const { dashboard } = await getCurrentDashboard();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Profil"
        title="Oyuncu kartın, senin imzan"
        description="Seçili temalar, unvanın, kısa biyografin ve son ustalık izlerin burada bir araya geliyor."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel strong className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold text-slate-950"
              style={{ background: dashboard.profile.avatarRenk }}
            >
              {dashboard.profile.gorunenAd.charAt(0)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-soft">
                @{dashboard.profile.kullaniciAdi}
              </p>
              <h2 className="mt-2 font-display text-4xl">
                {dashboard.profile.gorunenAd}
              </h2>
              <p className="mt-2 text-sm text-muted">{dashboard.profile.unvan}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">{dashboard.profile.bio}</p>
        </Panel>

        <Panel className="p-6">
          <ProfileEditor
            gorunenAd={dashboard.profile.gorunenAd}
            bio={dashboard.profile.bio}
            unvan={dashboard.profile.unvan}
          />
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          etiket="Seviye"
          deger={dashboard.progression.level}
          aciklama="Genel profil seviyen."
        />
        <StatCard
          etiket="Yıldız"
          deger={dashboard.progression.stars}
          aciklama="Prestij öncesi vitrin puanın."
        />
        <StatCard
          etiket="Seri"
          deger={dashboard.progression.gunlukSeri}
          aciklama="Kesintisiz giriş ritmin."
        />
        <StatCard
          etiket="Rekabet puanı"
          deger={dashboard.progression.rankedPuan}
          aciklama="Düello sahnesindeki güncel konumun."
        />
      </div>
    </div>
  );
}
