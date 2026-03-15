import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { ok, fail } from "@/services/http";
import { ensureTournamentSeeded } from "@/tournaments/service";

export async function GET() {
  try {
    await ensureTournamentSeeded();
    const user = await getSessionUser();

    const tournaments = await prisma.tournament.findMany({
      include: user
        ? {
            entries: {
              where: { userId: user.id },
              take: 1,
            },
          }
        : {
            entries: {
              take: 0,
            },
          },
      orderBy: {
        startsAt: "asc",
      },
    });

    return ok({
      turnuvalar: tournaments.map((entry) => ({
        id: entry.id,
        slug: entry.slug,
        ad: entry.name,
        altBaslik: entry.subtitle,
        aciklama: entry.description,
        durum: entry.status,
        format: entry.format,
        sezon: entry.season,
        baslangic: entry.startsAt.toISOString(),
        bitis: entry.endsAt.toISOString(),
        kayitKapanis: entry.registrationClosesAt.toISOString(),
        maxKatilimci: entry.maxParticipants,
        oduller: entry.rewards,
        kurallar: entry.rules,
        vurguRenkleri: entry.bannerTheme,
        katilimDurumu: entry.entries[0]?.status ?? null,
      })),
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Turnuvalar yüklenemedi.",
      500,
    );
  }
}
