import { requireSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { NotificationCenter } from "@/features/notifications/notification-center";
import { SectionTitle } from "@/components/ui/section-title";

export default async function NotificationsPage() {
  const user = await requireSessionUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Bildirimler"
        title="Platformun sıcak nabzı burada"
        description="Görev tamamlanmaları, başarım açılımları, günlük ödüller ve turnuva hareketleri tek merkezde birikir."
      />
      <NotificationCenter
        initialNotifications={notifications.map((entry) => ({
          id: entry.id,
          baslik: entry.title,
          icerik: entry.body,
          tip: entry.type,
          okundu: entry.isRead,
          baglanti: entry.actionUrl,
          tarih: entry.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
