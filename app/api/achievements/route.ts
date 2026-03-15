import { getSessionUser } from "@/auth/session";
import { buildAchievementEntries } from "@/achievements/helpers";
import { toDashboardSnapshot } from "@/server/snapshots";
import { ok, fail } from "@/services/http";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  const snapshot = toDashboardSnapshot(user);
  return ok({
    basarimlar: buildAchievementEntries(snapshot.achievementProgress),
  });
}
