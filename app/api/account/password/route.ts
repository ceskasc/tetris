import { getSessionUser } from "@/auth/session";
import { changePassword } from "@/auth/service";
import { changePasswordSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = changePasswordSchema.parse(await request.json());
    await changePassword({
      userId: user.id,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return ok({
      mesaj: "Parola güvenle güncellendi.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Parola güncellenemedi.",
      400,
    );
  }
}
