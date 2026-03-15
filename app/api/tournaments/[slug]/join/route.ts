import { getSessionUser } from "@/auth/session";
import { ok, fail } from "@/services/http";
import { joinTournament } from "@/tournaments/service";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: Context) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("Oturum bulunamadı.", 401);
    }

    const { slug } = await context.params;
    const entry = await joinTournament(user.id, slug);
    return ok({
      katilim: entry,
      mesaj: "Turnuva katılımın tamamlandı.",
    });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Turnuvaya katılım başarısız oldu.",
      400,
    );
  }
}
