import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { recordGameSession } from "@/progression/service";
import { ok, fail } from "@/services/http";

const sessionSchema = z.object({
  mod: z.enum(["klasik", "rahat", "zen", "sprint", "gorev", "gunluk", "duello"]),
  skor: z.number().min(0),
  satir: z.number().min(0),
  sureMs: z.number().min(0),
  comboEnYuksek: z.number().min(0),
  level: z.number().min(1),
  perfectClear: z.number().min(0),
  backToBack: z.number().min(0),
  kazanilanXp: z.number().min(0),
  hatalar: z.number().min(0),
  sonuc: z.enum(["galibiyet", "maglubiyet"]).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = sessionSchema.parse(await request.json());
    const sonuc = await recordGameSession(user.id, body);
    return ok({ sonuc, mesaj: "Seans işlendi." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Seans kaydedilemedi.",
      400,
    );
  }
}
