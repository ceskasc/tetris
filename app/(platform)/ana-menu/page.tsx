import Link from "next/link";

import { getCurrentDashboard } from "@/server/current-user";
import { getFeaturedQuests } from "@/quests/helpers";
import { getRecentlyUnlocked } from "@/achievements/helpers";
import { tournamentDefinitions } from "@/data/tournaments";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/utils/format";

export default async function HomePage() {
  const { dashboard } = await getCurrentDashboard();
  const featuredQuests = getFeaturedQuests(dashboard.questProgress);
  const recentAchievements = getRecentlyUnlocked(dashboard.achievementProgress);
  const featuredTournament = tournamentDefinitions[0];
  const levelProgress =
    (dashboard.progression.xp / dashboard.progression.nextLevelXp) * 100;

  return (
    <div className="space-y-6">
      <Panel strong className="p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <SectionTitle
              eyebrow="Bugünün Ritmi"
              title={`${dashboard.profile.gorunenAd}, akışın hazır.`}
              description="Seansların, online performansın, görevlerin ve yeni açılımlar tek bakışta burada. Bugün ister sakin bir zen akışı kur, ister canlı bir düelloya çık."
            />
            <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">Seviye {dashboard.progression.level}</span>
                <span className="text-muted">
                  Sonraki ödüle {formatNumber(dashboard.progression.nextLevelXp - dashboard.progression.xp)} XP
                </span>
              </div>
              <ProgressBar value={levelProgress} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/modlar">
                <Button>Oyuna başla</Button>
              </Link>
              <Link href="/online">
                <Button variant="ghost">Online düelloya geç</Button>
              </Link>
            </div>
          </div>
          <Panel className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-soft">
              Öne çıkan turnuva
            </p>
            <h3 className="mt-3 font-display text-4xl">{featuredTournament.ad}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {featuredTournament.altBaslik}
            </p>
            <div className="mt-6 space-y-3">
              {featuredTournament.oduller.slice(0, 3).map((reward) => (
                <div
                  key={reward}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted"
                >
                  {reward}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          etiket="Toplam skor"
          deger={dashboard.statistics.toplamSkor}
          aciklama="Bugüne kadar kurduğun tüm ritimlerin toplam ağırlığı."
        />
        <StatCard
          etiket="Online oran"
          deger={`${dashboard.statistics.onlineGalibiyet}/${dashboard.statistics.onlineMaglubiyet}`}
          aciklama="Canlı düellolardaki güncel galibiyet-mağlubiyet dengesi."
        />
        <StatCard
          etiket="Perfect clear"
          deger={dashboard.statistics.perfectClearSayisi}
          aciklama="Tertemiz final dokunuşlarının birikimi."
        />
        <StatCard
          etiket="Açılan ödül"
          deger={dashboard.statistics.acilanOdulSayisi}
          aciklama="Koleksiyon vitrininde seni bekleyen premium parça sayısı."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-3xl">Öne çıkan görevler</h3>
            <Link href="/gorevler" className="text-sm text-muted">
              Tümünü gör
            </Link>
          </div>
          <div className="space-y-3">
            {featuredQuests.map((quest) => (
              <div
                key={quest.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{quest.ad}</p>
                    <p className="mt-1 text-sm text-muted">{quest.aciklama}</p>
                  </div>
                  <div className="min-w-20 text-right text-sm text-muted">
                    %{quest.oran}
                  </div>
                </div>
                <ProgressBar className="mt-3" value={quest.oran} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-3xl">Son açılan başarımlar</h3>
            <Link href="/basarimlar" className="text-sm text-muted">
              Koleksiyona geç
            </Link>
          </div>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{achievement.ad}</p>
                    <p className="mt-1 text-sm text-muted">{achievement.aciklama}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--secondary)]">
                      +{formatNumber(achievement.odulXp)} XP
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
