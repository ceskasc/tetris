import { requireSessionUser } from "@/auth/session";
import { SectionTitle } from "@/components/ui/section-title";
import { OnlineHub } from "@/features/online/online-hub";
import { signSocketToken } from "@/multiplayer/token";

export default async function OnlinePage() {
  const user = await requireSessionUser();
  const token = signSocketToken(user.id, user.username);

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Online Maç"
        title="Canlı rakiple temiz tempo savaşı"
        description="Hızlı eşleşme kuyruğu, özel oda kodu, hazır durumu ve canlı garbage akışı tek akışta birleşir."
      />
      <OnlineHub token={token} />
    </div>
  );
}
