import { clearSession } from "@/auth/session";
import { ok, fail } from "@/services/http";

export async function POST() {
  try {
    await clearSession();
    return ok({ mesaj: "Oturum kapatıldı." });
  } catch {
    return fail("Oturum kapatılırken bir hata oluştu.", 500);
  }
}
