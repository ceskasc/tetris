import { resetPassword } from "@/auth/service";
import { resetPasswordSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";

export async function POST(request: Request) {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    await resetPassword(body);

    return ok({
      mesaj: "Parolan güncellendi. Yeni parolanla giriş yapabilirsin.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Parola güncellenemedi.",
      400,
    );
  }
}
