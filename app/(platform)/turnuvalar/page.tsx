import { prisma } from "@/db/prisma";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";
import { TournamentJoinButton } from "@/features/tournaments/join-button";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      entries: true,
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Turnuvalar"
        title="Sezon sahnesi her an hareketli"
        description="Yaklaşan kupaları incele, kayıtlarını tamamla ve performansını resmi yarışma geçmişine işle."
      />
      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <Panel key={tournament.id} className="p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-soft">
                  {tournament.season}
                </p>
                <h2 className="mt-3 font-display text-4xl">{tournament.name}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {tournament.description}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-muted">{tournament.format}</p>
                <p className="mt-2 text-sm text-muted">
                  Başlangıç: {new Intl.DateTimeFormat("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(tournament.startsAt)}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Katılım: {tournament.entries.length}/{tournament.maxParticipants}
                </p>
                <div className="mt-4">
                  <TournamentJoinButton slug={tournament.slug} />
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
