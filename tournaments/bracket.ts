type EntryLike = {
  id: string;
  userId: string;
  seed: number | null;
  points: number;
  rank: number | null;
  status: string;
  user: {
    username: string;
    profile: {
      displayName: string;
    } | null;
  };
};

type MatchLike = {
  id: string;
  round: number;
  playerOneId: string;
  playerTwoId: string;
  winnerId: string | null;
};

export type BracketRound = {
  round: number;
  matches: {
    id: string;
    playerOne: string;
    playerTwo: string;
    winner: string | null;
    durum: string;
  }[];
};

function getDisplayName(entry: EntryLike | undefined) {
  if (!entry) {
    return "Bekleniyor";
  }

  return entry.user.profile?.displayName ?? entry.user.username;
}

export function buildTournamentBracket(entries: EntryLike[], matches: MatchLike[]) {
  const sortedEntries = [...entries].sort((left, right) => {
    const leftSeed = left.seed ?? Number.MAX_SAFE_INTEGER;
    const rightSeed = right.seed ?? Number.MAX_SAFE_INTEGER;
    return leftSeed - rightSeed;
  });

  const entryByUserId = new Map(
    sortedEntries.map((entry) => [entry.userId, entry] as const),
  );

  if (matches.length) {
    const grouped = new Map<number, BracketRound["matches"]>();

    for (const match of matches) {
      const playerOne = entryByUserId.get(match.playerOneId);
      const playerTwo = entryByUserId.get(match.playerTwoId);
      const winner = match.winnerId
        ? getDisplayName(entryByUserId.get(match.winnerId))
        : null;
      const bucket = grouped.get(match.round) ?? [];
      bucket.push({
        id: match.id,
        playerOne: getDisplayName(playerOne),
        playerTwo: getDisplayName(playerTwo),
        winner,
        durum: winner ? "Tamamlandı" : "Bekleniyor",
      });
      grouped.set(match.round, bucket);
    }

    return [...grouped.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([round, roundMatches]) => ({
        round,
        matches: roundMatches,
      }));
  }

  const projected: BracketRound[] = [];
  let round = 1;
  let current = sortedEntries.map((entry) => ({
    id: entry.id,
    ad: getDisplayName(entry),
  }));

  while (current.length > 1) {
    const matchesForRound: BracketRound["matches"] = [];
    const nextRound: typeof current = [];

    for (let index = 0; index < current.length; index += 2) {
      const playerOne = current[index];
      const playerTwo = current[index + 1];
      matchesForRound.push({
        id: `projeksiyon-${round}-${index}`,
        playerOne: playerOne?.ad ?? "Bekleniyor",
        playerTwo: playerTwo?.ad ?? "BYE",
        winner: !playerTwo ? playerOne.ad : null,
        durum: !playerTwo ? "BYE geçti" : "Projeksiyon",
      });
      nextRound.push({
        id: playerOne.id,
        ad: !playerTwo ? playerOne.ad : "Kazanan bekleniyor",
      });
    }

    projected.push({
      round,
      matches: matchesForRound,
    });

    current = nextRound;
    round += 1;
  }

  return projected;
}

export function buildLeaderboard(entries: EntryLike[]) {
  return [...entries]
    .sort((left, right) => {
      const rankDelta = (left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER);
      if (rankDelta !== 0) {
        return rankDelta;
      }
      return right.points - left.points;
    })
    .map((entry, index) => ({
      sira: entry.rank ?? index + 1,
      oyuncu: getDisplayName(entry),
      puan: entry.points,
      durum: entry.status,
    }));
}
