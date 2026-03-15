import { cookies } from "next/headers";

import { hashOpaqueToken } from "@/auth/tokens";
import { requireSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { getNextDailyRewardPreview } from "@/persistence/service";
import { AccountPanel } from "@/features/account/account-panel";
import { SessionManager } from "@/features/account/session-manager";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";
import { StatCard } from "@/components/ui/stat-card";

export default async function AccountPage() {
  const user = await requireSessionUser();
  const cookieStore = await cookies();
  const currentToken = cookieStore.get("lunara_session")?.value;
  const currentHash = currentToken ? hashOpaqueToken(currentToken) : null;

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: {
      lastSeenAt: "desc",
    },
    take: 6,
  });

  const rewardPreview = getNextDailyRewardPreview(user.progression?.dailyStreak ?? 0);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Hesap"
        title="Güvenlik, oturum ve veri taşıma merkezi"
        description="Bu alan hesap güvenliği ile oyun verisi yönetimini aynı yerde toplar. Parolanı yenileyebilir, kayıt dosyanı indirebilir ve kontrollü sıfırlama yapabilirsin."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          etiket="Açık oturum"
          deger={sessions.length}
          aciklama="Son görülen cihaz oturumları."
        />
        <StatCard
          etiket="Doğrulama"
          deger={user.emailVerifiedAt ? "Hazır" : "Bekliyor"}
          aciklama="E-posta güvenlik durumu."
        />
        <StatCard
          etiket="Sonraki ödül"
          deger={rewardPreview.ad}
          aciklama="Günlük dönüşünde seni bekleyen ödül."
        />
        <StatCard
          etiket="Ödül XP"
          deger={rewardPreview.xp}
          aciklama="Bir sonraki günlük giriş katkısı."
        />
      </div>

      <Panel className="p-6">
        <h3 className="font-display text-3xl">Oturum geçmişi</h3>
        <div className="mt-5">
          <SessionManager
            initialSessions={sessions.map((session) => ({
              id: session.id,
              userAgent: session.userAgent,
              ipAddress: session.ipAddress,
              lastSeenAt: session.lastSeenAt.toISOString(),
              current: session.tokenHash === currentHash,
            }))}
          />
        </div>
      </Panel>

      <AccountPanel email={user.email} emailVerified={Boolean(user.emailVerifiedAt)} />
    </div>
  );
}
