import { getCurrentDashboard } from "@/server/current-user";
import { StatCard } from "@/components/ui/stat-card";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";
import { getAverageMinutes, getWinRate } from "@/statistics/helpers";

export default async function StatisticsPage() {
  const { dashboard } = await getCurrentDashboard();
  const summary = dashboard.statistics;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="İstatistikler"
        title="Her seansın izi görünür olsun"
        description="Toplam maç sayısından online verim oranına kadar tüm ilerleme katmanları; sade ama zengin bir bilgi mimarisiyle burada."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          etiket="Toplam maç"
          deger={summary.toplamMac}
          aciklama="Tamamlanan tüm seansların güncel toplamı."
        />
        <StatCard
          etiket="Ortalama süre"
          deger={`${getAverageMinutes(summary)} dk`}
          aciklama="Bir seansın seni ne kadar tuttuğunu gösteren nabız ölçüsü."
        />
        <StatCard
          etiket="Online kazanma"
          deger={`%${getWinRate(summary)}`}
          aciklama="Canlı düellolardaki güncel kazanma oranı."
        />
        <StatCard
          etiket="En uzun combo"
          deger={summary.enUzunCombo}
          aciklama="Kurduğun en rafine çizgi zincirinin zirvesi."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-6">
          <h3 className="font-display text-3xl">Tamamlama yüzdeleri</h3>
          <div className="mt-5 space-y-5">
            <div>
              <div className="mb-3 flex items-center justify-between text-sm text-muted">
                <span>Görev tamamlama</span>
                <span>%{summary.gorevTamamlamaOrani}</span>
              </div>
              <ProgressBar value={summary.gorevTamamlamaOrani} />
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between text-sm text-muted">
                <span>Başarım tamamlama</span>
                <span>%{summary.basarimTamamlamaOrani}</span>
              </div>
              <ProgressBar value={summary.basarimTamamlamaOrani} />
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="font-display text-3xl">Oyuncu özeti</h3>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Favori mod</span>
              <span>{summary.favoriMod}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Turnuva katılımı</span>
              <span>{summary.turnuvaKatilim}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>En iyi derece</span>
              <span>{summary.enIyiDerece ?? "Henüz yok"}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
