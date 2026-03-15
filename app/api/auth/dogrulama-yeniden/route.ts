import { resendVerification } from "@/auth/service";
import { resendVerificationSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";

export async function POST(request: Request) {
  try {
    const body = resendVerificationSchema.parse(await request.json());
    await resendVerification(body.email);

    return ok({
      mesaj: "Uygun hesap bulunduysa doğrulama bağlantısı yeniden gönderildi.",
    });
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "Doğrulama bağlantısı yeniden gönderilemedi.",
      400,
    );
  }
}
