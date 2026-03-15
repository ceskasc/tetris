import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { fail, ok } from "@/services/http";

const finishMatchSchema = z.object({
  roomCode: z.string().min(4),
  winnerId: z.string().min(1),
  sonuc: z.enum(["galibiyet", "maglubiyet"]),
  reason: z.enum(["top-out", "disconnect-timeout"]).optional(),
  roundWins: z.record(z.string(), z.number().int().min(0)).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = finishMatchSchema.parse(await request.json());
    const match = await prisma.onlineMatch.findUnique({
      where: { roomCode: body.roomCode },
      include: { participants: true },
    });

    if (!match) {
      return fail("Maç odası bulunamadı.", 404);
    }

    const participant = match.participants.find((entry) => entry.userId === user.id);
    if (!participant) {
      return fail("Bu maçın katılımcısı değilsin.", 403);
    }

    if (
      match.status === "tamamlandi" &&
      match.winnerId &&
      match.winnerId !== body.winnerId
    ) {
      return fail("Maç sonucu farklı bir kazanan ile kapanmış.", 409);
    }

    const currentMetadata =
      match.metadata && typeof match.metadata === "object" && !Array.isArray(match.metadata)
        ? (match.metadata as Record<string, unknown>)
        : {};

    const metadata: Prisma.InputJsonValue = {
      ...currentMetadata,
      kapanis: {
        neden: body.reason ?? null,
        bildirimiYapan: user.id,
      },
      setOzeti: {
        ...(typeof currentMetadata.setOzeti === "object" &&
        currentMetadata.setOzeti &&
        !Array.isArray(currentMetadata.setOzeti)
          ? (currentMetadata.setOzeti as Record<string, unknown>)
          : {}),
        roundWins: body.roundWins ?? null,
      },
    };

    await prisma.$transaction(async (tx) => {
      await tx.onlineMatch.update({
        where: { id: match.id },
        data: {
          status: "tamamlandi",
          winnerId: body.winnerId,
          endedAt: match.endedAt ?? new Date(),
          metadata,
        },
      });

      for (const entry of match.participants) {
        await tx.onlineMatchParticipant.update({
          where: { id: entry.id },
          data: {
            outcome: entry.userId === body.winnerId ? "galibiyet" : "maglubiyet",
          },
        });
      }
    });

    return ok({
      mesaj: "Maç sonucu işlendi.",
      zatenKapaliydi: match.status === "tamamlandi",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Maç sonucu kaydedilemedi.",
      400,
    );
  }
}
