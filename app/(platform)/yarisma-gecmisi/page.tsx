import { requireSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";

export default async function CompetitionHistoryPage() {
  const user = await requireSessionUser();
  const entries = await prisma.tournamentEntry.findMany({
    where: { userId: user.id },
    include: {
      tournament: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Yarışma Geçmişi"
        title="Katıldığın sahneler burada sıralanır"
        description="Turnuva kayıtların, derecelerin ve ileride büyüyecek sezon arşivin tek akışta toplanır."
      />

      <div className="grid gap-4">
        {entries.length ? (
          entries.map((entry) => (
            <Panel key={entry.id} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{entry.tournament.name}</h3>
                  <p className="mt-2 text-sm text-muted">{entry.tournament.subtitle}</p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>Durum: {entry.status}</p>
                  <p>Puan: {entry.points}</p>
                </div>
              </div>
            </Panel>
          ))
        ) : (
          <Panel className="p-6">
            <p className="text-sm text-muted">
              Henüz resmi bir yarışma geçmişi yok. İlk katılımını yaparak vitrini başlatabilirsin.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
