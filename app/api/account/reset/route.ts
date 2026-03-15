import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { resetUserProgress } from "@/persistence/service";
import { ok, fail } from "@/services/http";

const resetSchema = z.object({
  onay: z.literal("LUNARA SIFIRLA"),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = resetSchema.parse(await request.json());
    await resetUserProgress(user.id);

    return ok({
      mesaj: `İlerleme sıfırlandı. Onay metni: ${body.onay}`,
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "İlerleme sıfırlanamadı.",
      400,
    );
  }
}
