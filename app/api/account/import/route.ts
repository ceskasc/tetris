import { getSessionUser } from "@/auth/session";
import { importUserData } from "@/persistence/service";
import { ok, fail } from "@/services/http";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = await request.json();
    await importUserData(user.id, body);

    return ok({
      mesaj: "Kayıt dosyası başarıyla içe aktarıldı.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Kayıt dosyası içe aktarılamadı.",
      400,
    );
  }
}
