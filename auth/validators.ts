import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.email("Geçerli bir e-posta adresi gir."),
    username: z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
      .max(20, "Kullanıcı adı 20 karakteri geçmemeli.")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Kullanıcı adı yalnızca harf, rakam, nokta, alt çizgi ve kısa çizgi içerebilir.",
      ),
    password: z
      .string()
      .min(8, "Parola en az 8 karakter olmalı.")
      .regex(/[A-ZÇĞİÖŞÜ]/, "Parola en az bir büyük harf içermeli.")
      .regex(/[a-zçğıöşü]/, "Parola en az bir küçük harf içermeli.")
      .regex(/[0-9]/, "Parola en az bir rakam içermeli."),
    displayName: z
      .string()
      .min(2, "Görünen ad en az 2 karakter olmalı.")
      .max(32, "Görünen ad 32 karakteri geçmemeli."),
  })
  .strict();

export const loginSchema = z
  .object({
    emailOrUsername: z.string().min(3, "E-posta veya kullanıcı adı gir."),
    password: z.string().min(8, "Parolanı gir."),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.email("Geçerli bir e-posta adresi gir."),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Geçerli bir sıfırlama bağlantısı kullan."),
    password: z
      .string()
      .min(8, "Yeni parola en az 8 karakter olmalı.")
      .regex(/[A-ZÇĞİÖŞÜ]/, "Yeni parola en az bir büyük harf içermeli.")
      .regex(/[a-zçğıöşü]/, "Yeni parola en az bir küçük harf içermeli.")
      .regex(/[0-9]/, "Yeni parola en az bir rakam içermeli."),
  })
  .strict();

export const resendVerificationSchema = z
  .object({
    email: z.email("Geçerli bir e-posta adresi gir."),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Mevcut parolanı gir."),
    newPassword: z
      .string()
      .min(8, "Yeni parola en az 8 karakter olmalı.")
      .regex(/[A-ZÇĞİÖŞÜ]/, "Yeni parola en az bir büyük harf içermeli.")
      .regex(/[a-zçğıöşü]/, "Yeni parola en az bir küçük harf içermeli.")
      .regex(/[0-9]/, "Yeni parola en az bir rakam içermeli."),
  })
  .strict();
