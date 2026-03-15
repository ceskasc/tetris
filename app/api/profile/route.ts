import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { toDashboardSnapshot } from "@/server/snapshots";
import { ok, fail } from "@/services/http";

const profileSchema = z.object({
  gorunenAd: z.string().min(2).max(32),
  bio: z.string().max(180),
  unvan: z.string().min(2).max(32),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  return ok({
    profil: toDashboardSnapshot(user).profile,
  });
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = profileSchema.parse(await request.json());

    await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        displayName: body.gorunenAd,
        bio: body.bio,
        title: body.unvan,
      },
    });

    return ok({ mesaj: "Profil güncellendi." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Profil güncellenemedi.",
      400,
    );
  }
}
