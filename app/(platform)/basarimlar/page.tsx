import { buildAchievementEntries } from "@/achievements/helpers";
import { getCurrentDashboard } from "@/server/current-user";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";

export default async function AchievementsPage() {
  const { dashboard } = await getCurrentDashboard();
  const achievements = buildAchievementEntries(dashboard.achievementProgress);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Başarımlar"
        title="Ustalığın görünür hafızası"
        description="Skor, combo, temizlik, online rekabet ve koleksiyon odaklı her eşik; oyuncu kartında kalıcı bir iz bırakır."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {achievements.map((achievement) => (
          <Panel key={achievement.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-soft">
                  {achievement.kategori}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{achievement.ad}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {achievement.gizli && !achievement.acildi
                    ? "Bu başarımın ayrıntıları, kilidi açılana kadar saklı kalır."
                    : achievement.aciklama}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted">
                {achievement.rarity}
              </div>
            </div>
            <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">İlerleme</span>
                <span className="text-muted">%{achievement.oran}</span>
              </div>
              <ProgressBar value={achievement.oran} />
              <p className="mt-4 text-sm text-muted">
                Ödül: {achievement.odulXp} XP
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
