import { createSession } from "@/auth/session";
import { registerUser } from "@/auth/service";
import { registerSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";
import { getRequestMeta } from "@/services/request-meta";
import { enforceRateLimit } from "@/services/rate-limit";

export async function POST(request: Request) {
  try {
    const meta = getRequestMeta(request);
    const gate = enforceRateLimit(`register:${meta.ipAddress ?? "anon"}`, 5);

    if (!gate.allowed) {
      return fail("Çok sık kayıt denemesi yapıldı. Biraz sonra tekrar dene.", 429);
    }

    const body = registerSchema.parse(await request.json());
    const user = await registerUser(body);
    await createSession(user.id, meta);

    return ok(
      {
        mesaj: "Hesabın hazırlandı. Doğrulama bağlantısı e-posta adresine gönderildi.",
      },
      { status: 201 },
    );
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Kayıt sırasında bir hata oluştu.",
      400,
    );
  }
}
