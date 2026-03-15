import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { fail, ok } from "@/services/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return ok({
    okunmamisBildirim: unreadCount,
    gunlukSeri: user.progression?.dailyStreak ?? 0,
  });
}
