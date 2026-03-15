import { z } from "zod";
import { nanoid } from "nanoid";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { ok, fail } from "@/services/http";

const createRoomSchema = z.object({
  enIyiKac: z.number().min(1).max(7).default(3),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = createRoomSchema.parse(await request.json());
    const roomCode = nanoid(6).toUpperCase();

    const match = await prisma.onlineMatch.create({
      data: {
        roomCode,
        bestOf: body.enIyiKac,
        mode: "duello",
        metadata: {
          tur: "ozel-oda",
        },
        participants: {
          create: {
            userId: user.id,
            seat: 1,
          },
        },
      },
    });

    return ok({
      odaKodu: roomCode,
      macId: match.id,
      mesaj: "Özel oda hazır.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Özel oda oluşturulamadı.",
      400,
    );
  }
}
