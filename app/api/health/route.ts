import { prisma } from "@/db/prisma";
import { getAllowedOrigins, getServerEnv, isSmtpConfigured } from "@/server/env";
import { ok } from "@/services/http";

export async function GET() {
  const env = getServerEnv();
  let db = "hazır";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "erişilemiyor";
  }

  return ok(
    {
      durum: db === "hazır" ? "hazır" : "kısıtlı",
      zaman: new Date().toISOString(),
      servisler: {
        veritabani: db,
        smtp: isSmtpConfigured() ? "hazır" : "geliştirme-modu",
        socket: env.NEXT_PUBLIC_SOCKET_URL,
      },
      dagitim: {
        uygulamaUrl: env.NEXT_PUBLIC_APP_URL,
        izinliOriginler: getAllowedOrigins(),
      },
    },
    {
      status: db === "hazır" ? 200 : 503,
    },
  );
}
