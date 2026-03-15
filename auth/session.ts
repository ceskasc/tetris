import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/db/prisma";
import { routes } from "@/constants/routes";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/auth/constants";
import { createOpaqueToken, hashOpaqueToken } from "@/auth/tokens";

export async function createSession(userId: string, metadata?: { userAgent?: string | null; ipAddress?: string | null; }) {
  const rawToken = createOpaqueToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashOpaqueToken(rawToken),
      expiresAt,
      ipAddress: metadata?.ipAddress ?? undefined,
      userAgent: metadata?.userAgent ?? undefined,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashOpaqueToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashOpaqueToken(token),
    },
    include: {
      user: {
        include: {
          profile: true,
          progression: true,
          settings: true,
          statistics: true,
          cosmetics: true,
          achievements: true,
          quests: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  const lastSeenDiff = Date.now() - session.lastSeenAt.getTime();
  if (lastSeenDiff > 1000 * 60 * 15) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
  }

  return session.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect(routes.login);
  }

  return user;
}
