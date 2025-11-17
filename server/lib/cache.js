const store = new Map();

function resolveTtl(ttlMs) {
  const ttl = Number(ttlMs);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 0;
}

export function clearCache() {
  store.clear();
}

export async function cached(key, ttlMs, factory) {
  const ttl = resolveTtl(ttlMs);
  const now = Date.now();
  const existing = store.get(key);

  if (existing && (!ttl || existing.expiresAt > now)) {
    return existing.value;
  }

  const value = await factory();

  store.set(key, {
    value,
    expiresAt: ttl ? now + ttl : Infinity,
  });

  return value;
}
