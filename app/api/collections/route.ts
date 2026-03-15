import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { buildCollectionEntries } from "@/collections/helpers";
import { prisma } from "@/db/prisma";
import { toDashboardSnapshot } from "@/server/snapshots";
import { ok, fail } from "@/services/http";

const collectionSchema = z.object({
  cosmeticId: z.string(),
  action: z.enum(["equip", "favorite", "mark-seen"]),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  const snapshot = toDashboardSnapshot(user);
  return ok({
    koleksiyon: buildCollectionEntries(snapshot.cosmetics),
  });
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = collectionSchema.parse(await request.json());

    if (body.action === "equip") {
      const cosmetic = await prisma.cosmetic.findUniqueOrThrow({
        where: { id: body.cosmeticId },
      });

      await prisma.userCosmetic.updateMany({
        where: {
          userId: user.id,
          cosmetic: {
            is: {
              category: cosmetic.category,
            },
          },
        },
        data: {
          isEquipped: false,
        },
      });

      await prisma.userCosmetic.update({
        where: {
          userId_cosmeticId: {
            userId: user.id,
            cosmeticId: body.cosmeticId,
          },
        },
        data: {
          isEquipped: true,
          isNew: false,
        },
      });
    }

    if (body.action === "favorite") {
      const current = await prisma.userCosmetic.findUniqueOrThrow({
        where: {
          userId_cosmeticId: {
            userId: user.id,
            cosmeticId: body.cosmeticId,
          },
        },
      });

      await prisma.userCosmetic.update({
        where: { id: current.id },
        data: {
          isFavorite: !current.isFavorite,
        },
      });
    }

    if (body.action === "mark-seen") {
      await prisma.userCosmetic.update({
        where: {
          userId_cosmeticId: {
            userId: user.id,
            cosmeticId: body.cosmeticId,
          },
        },
        data: {
          isNew: false,
        },
      });
    }

    return ok({ mesaj: "Koleksiyon güncellendi." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Koleksiyon güncellenemedi.",
      400,
    );
  }
}
