type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

export function enforceRateLimit(
  key: string,
  limit = 8,
  windowMs = 10 * 60 * 1000,
) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return { allowed: true, remaining: limit - entry.count };
}
