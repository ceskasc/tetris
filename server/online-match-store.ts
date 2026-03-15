import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import type { RoomSnapshot } from "@/multiplayer/protocol";

function mapStatus(status: RoomSnapshot["status"]) {
  switch (status) {
    case "bekleniyor":
      return "bekleniyor" as const;
    case "hazirlik":
      return "hazirlik" as const;
    case "oyunda":
      return "oyunda" as const;
    case "tamamlandi":
      return "tamamlandi" as const;
  }
}

function buildMetadata(snapshot: RoomSnapshot, source: string): Prisma.InputJsonValue {
  return {
    kaynak: source,
    setYapisi: {
      enIyiKac: snapshot.bestOf,
      hedefGalibiyet: snapshot.roundTarget,
      aktifRound: snapshot.currentRound,
      sonrakiRoundAt: snapshot.nextRoundAt ?? null,
    },
    sonRound: snapshot.lastRoundWinnerId
      ? {
          kazananId: snapshot.lastRoundWinnerId,
          neden: snapshot.lastRoundReason ?? null,
        }
      : null,
    roundGecmisi: snapshot.roundHistory.map((entry) => ({
      round: entry.round,
      kazananId: entry.winnerId,
      neden: entry.reason,
      zaman: entry.at,
    })),
  } satisfies Record<string, unknown>;
}

export async function ensureOnlineMatchRecord(snapshot: RoomSnapshot, source: string) {
  const existing = await prisma.onlineMatch.findUnique({
    where: { roomCode: snapshot.roomCode },
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
    },
  });

  const match = existing
    ? await prisma.onlineMatch.update({
        where: { roomCode: snapshot.roomCode },
        data: {
          bestOf: snapshot.bestOf,
          status: mapStatus(snapshot.status),
          startedAt:
            existing.startedAt ?? (snapshot.currentRound > 0 ? new Date() : undefined),
          endedAt:
            snapshot.status === "tamamlandi"
              ? existing.endedAt ?? new Date()
              : existing.endedAt,
          winnerId: snapshot.winnerId ?? null,
          metadata: buildMetadata(snapshot, source),
        },
        select: { id: true },
      })
    : await prisma.onlineMatch.create({
        data: {
          roomCode: snapshot.roomCode,
          bestOf: snapshot.bestOf,
          mode: "duello",
          status: mapStatus(snapshot.status),
          startedAt: snapshot.currentRound > 0 ? new Date() : undefined,
          endedAt: snapshot.status === "tamamlandi" ? new Date() : undefined,
          winnerId: snapshot.winnerId ?? undefined,
          metadata: buildMetadata(snapshot, source),
        },
        select: { id: true },
      });

  for (const player of snapshot.players) {
    await prisma.onlineMatchParticipant.upsert({
      where: {
        matchId_userId: {
          matchId: match.id,
          userId: player.userId,
        },
      },
      update: {
        seat: player.seat,
        score: player.roundWins,
        attacksSent: player.attacksSent,
        linesCleared: player.lines,
        disconnectedAt: player.connected ? null : new Date(),
        outcome:
          snapshot.status === "tamamlandi" && snapshot.winnerId
            ? player.userId === snapshot.winnerId
              ? "galibiyet"
              : "maglubiyet"
            : undefined,
      },
      create: {
        matchId: match.id,
        userId: player.userId,
        seat: player.seat,
        score: player.roundWins,
        attacksSent: player.attacksSent,
        linesCleared: player.lines,
        disconnectedAt: player.connected ? null : new Date(),
        outcome:
          snapshot.status === "tamamlandi" && snapshot.winnerId
            ? player.userId === snapshot.winnerId
              ? "galibiyet"
              : "maglubiyet"
            : undefined,
      },
    });
  }
}
