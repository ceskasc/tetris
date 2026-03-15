import { getSessionUser } from "@/auth/session";
import { exportUserData } from "@/persistence/service";
import { ok, fail } from "@/services/http";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const payload = await exportUserData(user.id);
    return ok(payload);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Veri dışa aktarılamadı.",
      500,
    );
  }
}
