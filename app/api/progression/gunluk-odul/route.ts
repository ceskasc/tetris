import { getSessionUser } from "@/auth/session";
import { claimDailyReward } from "@/progression/service";
import { ok, fail } from "@/services/http";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const reward = await claimDailyReward(user.id);
    return ok({
      odul: reward,
      mesaj: "Günlük ödül hesabına işlendi.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Günlük ödül alınamadı.",
      400,
    );
  }
}
