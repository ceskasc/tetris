import { notFound } from "next/navigation";

import { prisma } from "@/db/prisma";
import { TournamentJoinButton } from "@/features/tournaments/join-button";
import { TournamentCompetitionView } from "@/features/tournaments/tournament-competition-view";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";
import { buildLeaderboard, buildTournamentBracket } from "@/tournaments/bracket";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      entries: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
      matches: true,
    },
  });

  if (!tournament) {
    notFound();
  }

  const rules = tournament.rules as string[];
  const rewards = tournament.rewards as string[];
  const bracket = buildTournamentBracket(tournament.entries, tournament.matches);
  const leaderboard = buildLeaderboard(tournament.entries);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Turnuva Detayı"
        title={tournament.name}
        description={tournament.description}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel className="p-6">
          <h3 className="font-display text-3xl">Kurallar</h3>
          <div className="mt-5 space-y-3 text-sm text-muted">
            {rules.map((rule) => (
              <div
                key={rule}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                {rule}
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-6">
          <h3 className="font-display text-3xl">Ödüller</h3>
          <div className="mt-5 space-y-3 text-sm text-muted">
            {rewards.map((reward) => (
              <div
                key={reward}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                {reward}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <TournamentJoinButton slug={tournament.slug} />
          </div>
          <p className="mt-4 text-sm text-muted">
            Katılımcı sayısı: {tournament.entries.length}/{tournament.maxParticipants}
          </p>
        </Panel>
      </div>

      <TournamentCompetitionView
        format={tournament.format}
        bracket={bracket}
        leaderboard={leaderboard}
      />

      <Panel className="p-6">
        <h3 className="font-display text-3xl">Katılımcılar</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tournament.entries.length ? (
            tournament.entries.map((entry, index) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm"
              >
                <p className="text-soft">Sıra {entry.seed ?? index + 1}</p>
                <p className="mt-2 font-semibold">
                  {entry.user.profile?.displayName ?? entry.user.username}
                </p>
                <p className="mt-1 text-muted">{entry.status}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">
              İlk katılımcılar geldikçe bracket ve tablo görünümü burada dolacak.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
