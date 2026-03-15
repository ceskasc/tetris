import nodemailer from "nodemailer";

import { getServerEnv, isSmtpConfigured } from "@/server/env";

function createTransport() {
  const env = getServerEnv();

  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

const transport = createTransport();

function getBaseUrl() {
  return getServerEnv().NEXT_PUBLIC_APP_URL;
}

export async function sendVerificationEmail(email: string, token: string) {
  const env = getServerEnv();
  const url = `${getBaseUrl()}/dogrula/${token}`;
  const info = await transport.sendMail({
    from: env.SMTP_FROM ?? "Lunara <no-reply@lunara.local>",
    to: email,
    subject: "Lunara hesabını doğrula",
    text: `Hesabını doğrulamak için bu bağlantıyı aç: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#0d1020;color:#f7f6ff">
      <h1 style="margin:0 0 16px;font-size:24px">Lunara hesabın hazır.</h1>
      <p style="line-height:1.7;margin:0 0 16px">E-posta adresini doğrulamak için aşağıdaki güvenli bağlantıyı kullan.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#7f6fff,#ffb4e7);color:#0d1020;text-decoration:none;font-weight:700">Hesabı doğrula</a></p>
      <p style="margin-top:18px;color:#cfc8ff">${url}</p>
    </div>`,
  });

  if (!isSmtpConfigured()) {
    console.info("Dogrulama baglantisi", url, info.messageId);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const env = getServerEnv();
  const url = `${getBaseUrl()}/sifre-sifirla/${token}`;
  const info = await transport.sendMail({
    from: env.SMTP_FROM ?? "Lunara <no-reply@lunara.local>",
    to: email,
    subject: "Lunara parola yenileme",
    text: `Parolanı yenilemek için bu bağlantıyı aç: ${url}`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#0d1020;color:#f7f6ff">
      <h1 style="margin:0 0 16px;font-size:24px">Parola yenileme isteği</h1>
      <p style="line-height:1.7;margin:0 0 16px">Bu isteği sen yaptıysan aşağıdaki bağlantı ile yeni parolanı belirleyebilirsin.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#5ebcff,#ffd0e6);color:#091321;text-decoration:none;font-weight:700">Parolayı yenile</a></p>
      <p style="margin-top:18px;color:#cfc8ff">${url}</p>
    </div>`,
  });

  if (!isSmtpConfigured()) {
    console.info("Sifirlama baglantisi", url, info.messageId);
  }
}
