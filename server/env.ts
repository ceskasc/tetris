import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL tanimli olmali."),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL gecerli bir URL olmali."),
  NEXT_PUBLIC_SOCKET_URL: z.string().url("NEXT_PUBLIC_SOCKET_URL gecerli bir URL olmali."),
  SOCKET_PORT: z.coerce.number().int().positive().default(3001),
  APP_SECRET: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

type ServerEnv = ReturnType<typeof parseServerEnv>;

let cachedEnv: ServerEnv | null = null;

function parseServerEnv() {
  const raw = baseEnvSchema.parse(process.env);
  const appSecret =
    raw.APP_SECRET && raw.APP_SECRET.trim().length >= 12
      ? raw.APP_SECRET
      : raw.NODE_ENV === "production"
        ? (() => {
            throw new Error("APP_SECRET production ortaminda zorunludur.");
          })()
        : "gelistirme-gizli-anahtari";

  return {
    ...raw,
    APP_SECRET: appSecret,
  };
}

export function getServerEnv() {
  if (!cachedEnv) {
    cachedEnv = parseServerEnv();
  }

  return cachedEnv;
}

export function getAllowedOrigins() {
  const env = getServerEnv();
  const origins = new Set<string>();

  origins.add(env.NEXT_PUBLIC_APP_URL);

  if (env.ALLOWED_ORIGINS) {
    env.ALLOWED_ORIGINS.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => origins.add(entry));
  }

  return [...origins];
}

export function isSmtpConfigured() {
  const env = getServerEnv();
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}
