import { createSession } from "@/auth/session";
import { loginUser } from "@/auth/service";
import { loginSchema } from "@/auth/validators";
import { ok, fail } from "@/services/http";
import { getRequestMeta } from "@/services/request-meta";
import { enforceRateLimit } from "@/services/rate-limit";

export async function POST(request: Request) {
  try {
    const meta = getRequestMeta(request);
    const gate = enforceRateLimit(`login:${meta.ipAddress ?? "anon"}`, 10);

    if (!gate.allowed) {
      return fail("Giriş denemeleri geçici olarak sınırlandı. Lütfen biraz bekle.", 429);
    }

    const body = loginSchema.parse(await request.json());
    const user = await loginUser(body);
    await createSession(user.id, meta);

    return ok({
      mesaj: "Giriş başarılı.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Giriş sırasında bir hata oluştu.",
      400,
    );
  }
}
