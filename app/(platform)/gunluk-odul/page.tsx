import { dailyRewards } from "@/data/quests";
import { DailyRewardClaim } from "@/features/daily-reward/claim-card";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";

export default function DailyRewardPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Günlük Ödül"
        title="Geri dönüşünü ödüllendiren sıcak bir ritim"
        description="Serin uzadıkça XP akışı büyür, haftalık eşikler daha değerli kozmetik parçalar açar."
      />
      <Panel className="p-6">
        <DailyRewardClaim />
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dailyRewards.map((reward) => (
          <Panel key={reward.gun} className="p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-soft">
              Gün {reward.gun}
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{reward.ad}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{reward.aciklama}</p>
            <p className="mt-4 text-sm text-[var(--secondary)]">{reward.xp} XP</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
