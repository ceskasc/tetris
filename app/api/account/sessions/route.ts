import { z } from "zod";

import { getSessionUser } from "@/auth/session";
import { prisma } from "@/db/prisma";
import { hashOpaqueToken } from "@/auth/tokens";
import { SESSION_COOKIE_NAME } from "@/auth/constants";
import { ok, fail } from "@/services/http";
import { cookies } from "next/headers";

const revokeSchema = z.object({
  sessionId: z.string().optional(),
  digerleri: z.boolean().optional(),
});

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const cookieStore = await cookies();
    const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const currentHash = currentToken ? hashOpaqueToken(currentToken) : null;
    const body = revokeSchema.parse(await request.json());

    if (body.digerleri) {
      await prisma.session.deleteMany({
        where: {
          userId: user.id,
          ...(currentHash ? { NOT: { tokenHash: currentHash } } : {}),
        },
      });
      return ok({ mesaj: "Diğer cihaz oturumları kapatıldı." });
    }

    if (!body.sessionId) {
      return fail("Oturum seçilmedi.", 400);
    }

    await prisma.session.deleteMany({
      where: {
        id: body.sessionId,
        userId: user.id,
      },
    });

    return ok({ mesaj: "Seçilen oturum kapatıldı." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Oturum kapatılamadı.",
      400,
    );
  }
}
