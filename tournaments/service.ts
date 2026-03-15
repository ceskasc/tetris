import { Prisma } from "@prisma/client";

import { achievementDefinitions } from "@/data/achievements";
import { questDefinitions } from "@/data/quests";
import { tournamentDefinitions } from "@/data/tournaments";
import { prisma } from "@/db/prisma";

export async function ensureTournamentSeeded() {
  await prisma.tournament.createMany({
    data: tournamentDefinitions.map((tournament) => ({
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.ad,
      subtitle: tournament.altBaslik,
      description: tournament.aciklama,
      status:
        tournament.durum === "kayit-acik"
          ? "kayit_acik"
          : tournament.durum === "devam-ediyor"
            ? "devam_ediyor"
            : tournament.durum,
      format: tournament.format,
      season: tournament.sezon,
      startsAt: new Date(tournament.baslangic),
      endsAt: new Date(tournament.bitis),
      registrationClosesAt: new Date(tournament.kayitKapanis),
      maxParticipants: tournament.maxKatilimci,
      rewards: tournament.oduller as Prisma.InputJsonValue,
      rules: tournament.kurallar as Prisma.InputJsonValue,
      bannerTheme: tournament.vurguRenkleri as Prisma.InputJsonValue,
    })),
    skipDuplicates: true,
  });
}

export async function joinTournament(userId: string, slug: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      entries: true,
    },
  });

  if (!tournament) {
    throw new Error("Turnuva bulunamadı.");
  }

  if (new Date() > tournament.registrationClosesAt) {
    throw new Error("Bu turnuva için kayıt süresi kapandı.");
  }

  if (tournament.entries.length >= tournament.maxParticipants) {
    throw new Error("Turnuva katılım kapasitesi doldu.");
  }

  const alreadyJoined = tournament.entries.find((entry) => entry.userId === userId);
  if (alreadyJoined) {
    return alreadyJoined;
  }

  const quest = questDefinitions.find((item) => item.id === "tournament-entry");
  const achievement = achievementDefinitions.find(
    (item) => item.id === "tournament-entry",
  );

  return prisma.$transaction(async (tx) => {
    const entry = await tx.tournamentEntry.create({
      data: {
        tournamentId: tournament.id,
        userId,
        status: "kayitli",
      },
    });

    await tx.userStatistics.update({
      where: { userId },
      data: {
        tournamentsJoined: {
          increment: 1,
        },
      },
    });

    if (quest) {
      const userQuest = await tx.userQuestProgress.findFirst({
        where: { userId, questId: quest.id },
      });

      if (userQuest) {
        await tx.userQuestProgress.update({
          where: { id: userQuest.id },
          data: {
            progress: 1,
            completed: true,
            claimedAt: new Date(),
          },
        });

        await tx.userProgression.update({
          where: { userId },
          data: {
            xp: {
              increment: quest.odulXp,
            },
          },
        });
      }
    }

    if (achievement) {
      const userAchievement = await tx.userAchievementProgress.findFirst({
        where: { userId, achievementId: achievement.id },
      });

      if (userAchievement && !userAchievement.unlockedAt) {
        await tx.userAchievementProgress.update({
          where: { id: userAchievement.id },
          data: {
            progress: 1,
            unlockedAt: new Date(),
            claimedAt: new Date(),
          },
        });

        await tx.userProgression.update({
          where: { userId },
          data: {
            xp: {
              increment: achievement.odulXp,
            },
          },
        });
      }
    }

    await tx.notification.create({
      data: {
        userId,
        title: `${tournament.name} için kayıt tamamlandı`,
        body: "Turnuva kartın hazır. Başlangıç saatinden önce hazırlık durumunu doğrulamayı unutma.",
        type: "turnuva",
        actionUrl: `/turnuvalar/${slug}`,
      },
    });

    return entry;
  });
}
