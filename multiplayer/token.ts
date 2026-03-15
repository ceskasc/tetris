import { createHmac } from "node:crypto";

import { getServerEnv } from "@/server/env";

type TokenPayload = {
  userId: string;
  username: string;
  exp: number;
};

function getSecret() {
  return getServerEnv().APP_SECRET;
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function signSocketToken(userId: string, username: string) {
  const payload: TokenPayload = {
    userId,
    username,
    exp: Date.now() + 1000 * 60 * 60,
  };
  const encoded = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret()).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

export function verifySocketToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = createHmac("sha256", getSecret()).update(encoded).digest("hex");
  if (expected !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as TokenPayload;

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
