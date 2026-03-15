import Link from "next/link";

import { verifyEmailToken } from "@/auth/service";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let title = "E-posta doğrulandı";
  let message =
    "Hesabın güvenle doğrulandı. Artık profilini, ilerlemeni ve online modlarını tam erişimle kullanabilirsin.";

  try {
    await verifyEmailToken(token);
  } catch (error) {
    title = "Bağlantı geçersiz";
    message =
      error instanceof Error
        ? error.message
        : "Doğrulama bağlantısı işlenemedi.";
  }

  return (
    <Panel strong className="mx-auto mt-16 max-w-xl p-10 text-center">
      <h1 className="font-display text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-muted">{message}</p>
      <Link href="/giris-yap" className="mt-6 inline-flex">
        <Button>Giriş ekranına geç</Button>
      </Link>
    </Panel>
  );
}
