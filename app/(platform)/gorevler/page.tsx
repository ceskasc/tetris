import { buildQuestEntries } from "@/quests/helpers";
import { getCurrentDashboard } from "@/server/current-user";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";

export default async function QuestsPage() {
  const { dashboard } = await getCurrentDashboard();
  const quests = buildQuestEntries(dashboard.questProgress);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Görevler"
        title="Her gün yeni bir akış bahanesi"
        description="Günlük, haftalık, milestone ve turnuva görevleri; kısa seanslardan uzun ustalık döngülerine kadar sürekli hareket üretir."
      />
      <div className="grid gap-4">
        {quests.map((quest) => (
          <Panel key={quest.id} className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-soft">
                    {quest.kategori}
                  </span>
                  <span className="text-xs uppercase tracking-[0.24em] text-soft">
                    {quest.zorluk}
                  </span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold">{quest.ad}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{quest.aciklama}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-soft">İlerleme</p>
                <p className="mt-3 text-3xl font-semibold">%{quest.oran}</p>
                <ProgressBar className="mt-4" value={quest.oran} />
                <p className="mt-4 text-sm text-muted">Ödül: {quest.odulXp} XP</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
