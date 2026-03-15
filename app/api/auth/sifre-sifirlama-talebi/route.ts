import { requestPasswordReset } from "@/auth/service";
import { forgotPasswordSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";
import { getRequestMeta } from "@/services/request-meta";
import { enforceRateLimit } from "@/services/rate-limit";

export async function POST(request: Request) {
  try {
    const meta = getRequestMeta(request);
    const gate = enforceRateLimit(`forgot:${meta.ipAddress ?? "anon"}`, 5);

    if (!gate.allowed) {
      return fail("Çok sık parola sıfırlama isteği gönderildi.", 429);
    }

    const body = forgotPasswordSchema.parse(await request.json());
    await requestPasswordReset(body.email);

    return ok({
      mesaj:
        "Eğer bu e-posta kayıtlıysa, güvenli parola yenileme bağlantısı gönderildi.",
    });
  } catch (error) {
    return fail(
      error instanceof Error
        ? error.message
        : "Parola sıfırlama isteği gönderilemedi.",
      400,
    );
  }
}
