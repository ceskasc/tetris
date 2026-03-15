import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { toSettingsSnapshot } from "@/server/snapshots";
import { ok, fail } from "@/services/http";

const settingsSchema = z.object({
  temaModu: z.enum(["sistem", "gece", "aydinlik"]),
  temaPaketi: z.string().min(2),
  azaltIlkHareket: z.boolean(),
  yuksekKontrast: z.boolean(),
  grafikYogunlugu: z.enum(["hafif", "dengeli", "yuksek"]),
  anaSes: z.number().min(0).max(100),
  muzikSes: z.number().min(0).max(100),
  efektSes: z.number().min(0).max(100),
  dokunmatikKontroller: z.boolean(),
  bildirimler: z.boolean(),
  titreSimdilik: z.boolean(),
  tusAtamalari: z.record(z.string(), z.string()),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail("Oturum bulunamadı.", 401);
  }

  return ok({
    ayarlar: toSettingsSnapshot(user),
  });
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const body = settingsSchema.parse(await request.json());

    await prisma.userSettings.update({
      where: { userId: user.id },
      data: {
        themeMode: body.temaModu,
        themePreset: body.temaPaketi,
        reducedMotion: body.azaltIlkHareket,
        highContrast: body.yuksekKontrast,
        graphicsDensity: body.grafikYogunlugu,
        masterVolume: body.anaSes,
        musicVolume: body.muzikSes,
        sfxVolume: body.efektSes,
        touchControls: body.dokunmatikKontroller,
        notificationsEnabled: body.bildirimler,
        vibrationEnabled: body.titreSimdilik,
        keyBindings: body.tusAtamalari,
      },
    });

    return ok({ mesaj: "Ayarlar kaydedildi." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Ayarlar kaydedilemedi.",
      400,
    );
  }
}
