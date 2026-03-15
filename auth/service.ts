import { Prisma } from "@prisma/client";

import { achievementDefinitions } from "@/data/achievements";
import { cosmeticsCatalog } from "@/data/cosmetics";
import { defaultSettings } from "@/data/showcase";
import { questDefinitions } from "@/data/quests";
import { prisma } from "@/db/prisma";
import { hashPassword, verifyPassword } from "@/auth/password";
import { createOpaqueToken, hashOpaqueToken } from "@/auth/tokens";
import {
  RESET_TOKEN_DURATION_MS,
  VERIFY_TOKEN_DURATION_MS,
} from "@/auth/constants";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/auth/email";

export async function registerUser(input: {
  email: string;
  username: string;
  password: string;
  displayName: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email.toLowerCase() }, { username: input.username.toLowerCase() }],
    },
  });

  if (existing) {
    throw new Error("Bu e-posta veya kullanıcı adı zaten kullanılıyor.");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.cosmetic.createMany({
    data: cosmeticsCatalog.map((item) => ({
      id: item.id,
      category: item.kategori,
      name: item.ad,
      description: item.aciklama,
      rarity: item.rarity,
      unlockSource: item.kaynak,
      palette: item.palette,
      glow: item.glow,
    })),
    skipDuplicates: true,
  });

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            displayName: input.displayName,
          },
        },
        settings: {
          create: {
            themeMode: defaultSettings.temaModu,
            themePreset: defaultSettings.temaPaketi,
            reducedMotion: defaultSettings.azaltIlkHareket,
            highContrast: defaultSettings.yuksekKontrast,
            graphicsDensity: defaultSettings.grafikYogunlugu,
            masterVolume: defaultSettings.anaSes,
            musicVolume: defaultSettings.muzikSes,
            sfxVolume: defaultSettings.efektSes,
            touchControls: defaultSettings.dokunmatikKontroller,
            notificationsEnabled: defaultSettings.bildirimler,
            vibrationEnabled: defaultSettings.titreSimdilik,
            keyBindings: defaultSettings.tusAtamalari as Prisma.InputJsonValue,
          },
        },
        statistics: {
          create: {
            gamesByMode: {} as Prisma.InputJsonValue,
            themeUsage: {} as Prisma.InputJsonValue,
          },
        },
        progression: {
          create: {
            modMastery: {} as Prisma.InputJsonValue,
            milestoneState: {} as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    await tx.userCosmetic.createMany({
      data: cosmeticsCatalog
        .filter((item) => item.kaynak === "Başlangıç seti")
        .map((item) => ({
          userId: created.id,
          cosmeticId: item.id,
          isEquipped: item.id === "board-gece-cicegi" || item.id === "skin-silk",
          isFavorite: item.id === "board-gece-cicegi",
          isNew: false,
        })),
    });

    await tx.userQuestProgress.createMany({
      data: questDefinitions.map((quest) => ({
        userId: created.id,
        questId: quest.id,
        goal: quest.hedef,
      })),
    });

    await tx.userAchievementProgress.createMany({
      data: achievementDefinitions.map((achievement) => ({
        userId: created.id,
        achievementId: achievement.id,
        goal: achievement.hedef,
      })),
    });

    return created;
  });

  await issueVerificationToken(user.id, user.email);

  return user;
}

export async function loginUser(input: { emailOrUsername: string; password: string }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.emailOrUsername.toLowerCase() },
        { username: input.emailOrUsername.toLowerCase() },
      ],
    },
  });

  if (!user) {
    throw new Error("Hesap bulunamadı.");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    throw new Error("Parola eşleşmiyor.");
  }

  return user;
}

export async function issueVerificationToken(userId: string, email: string) {
  const token = createOpaqueToken(24);
  const tokenHash = hashOpaqueToken(token);

  await prisma.verificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + VERIFY_TOKEN_DURATION_MS),
    },
  });

  await sendVerificationEmail(email, token);
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: {
      tokenHash: hashOpaqueToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    throw new Error("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
  }

  await prisma.$transaction([
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return record.user;
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return;
  }

  await issueVerificationToken(user.id, user.email);
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    return;
  }

  const token = createOpaqueToken(24);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashOpaqueToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
    },
  });

  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(input: { token: string; password: string }) {
  const record = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashOpaqueToken(input.token),
    },
  });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    throw new Error("Parola yenileme bağlantısı geçersiz veya süresi dolmuş.");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.session.deleteMany({
      where: { userId: record.userId },
    }),
  ]);
}

export async function changePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
  });

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Mevcut parola eşleşmiyor.");
  }

  const nextHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      passwordHash: nextHash,
    },
  });
}
