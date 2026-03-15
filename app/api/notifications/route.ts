import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { ok, fail } from "@/services/http";

const markSchema = z.object({
  id: z.string().optional(),
  tumu: z.boolean().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return ok({
    bildirimler: notifications.map((entry) => ({
      id: entry.id,
      baslik: entry.title,
      icerik: entry.body,
      tip: entry.type,
      okundu: entry.isRead,
      baglanti: entry.actionUrl,
      tarih: entry.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = markSchema.parse(await request.json());

    if (body.tumu) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return ok({ mesaj: "Tüm bildirimler okundu olarak işaretlendi." });
    }

    if (!body.id) {
      return fail("Bildirim seçilmedi.", 400);
    }

    await prisma.notification.updateMany({
      where: {
        id: body.id,
        userId: user.id,
      },
      data: {
        isRead: true,
      },
    });

    return ok({ mesaj: "Bildirim güncellendi." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Bildirim güncellenemedi.",
      400,
    );
  }
}
