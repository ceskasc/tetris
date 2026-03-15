import { Panel } from "@/components/ui/panel";
import type { BracketRound } from "@/tournaments/bracket";

export function TournamentCompetitionView({
  format,
  bracket,
  leaderboard,
}: {
  format: string;
  bracket: BracketRound[];
  leaderboard: {
    sira: number;
    oyuncu: string;
    puan: number;
    durum: string;
  }[];
}) {
  const isLeaderboard = format.toLowerCase().includes("puan");

  if (isLeaderboard) {
    return (
      <Panel className="p-6">
        <h3 className="font-display text-3xl">Puan tablosu</h3>
        <div className="mt-5 space-y-3">
          {leaderboard.length ? (
            leaderboard.map((entry) => (
              <div
                key={`${entry.sira}-${entry.oyuncu}`}
                className="grid grid-cols-[64px_1fr_100px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="text-soft">#{entry.sira}</span>
                <span>{entry.oyuncu}</span>
                <span className="text-right text-muted">{entry.puan} puan</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">
              Puan tablosu katılımcılar geldikçe şekillenecek.
            </p>
          )}
        </div>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {bracket.map((round) => (
        <Panel key={round.round} className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-soft">
            Tur {round.round}
          </p>
          <div className="mt-4 space-y-3">
            {round.matches.map((match) => (
              <div
                key={match.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold">{match.playerOne}</p>
                <p className="mt-1 text-sm text-muted">{match.playerTwo}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-soft">
                  {match.winner ? `Kazanan: ${match.winner}` : match.durum}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
