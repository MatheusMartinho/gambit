import localforage from "localforage";

type CacheValue<T> = {
  value: T;
  expiresAt: number;
};

localforage.config({
  name: "gambit-cache",
  storeName: "gambit_cache",
  description: "Cache local para dados fundamentalistas",
});

export async function setCacheItem<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const payload: CacheValue<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  await localforage.setItem(key, payload);
}

export async function getCacheItem<T>(key: string): Promise<T | null> {
  const payload = (await localforage.getItem<CacheValue<T>>(key)) ?? null;
  if (!payload) return null;

  if (payload.expiresAt <= Date.now()) {
    await localforage.removeItem(key);
    return null;
  }

  return payload.value;
}

export async function removeCacheItem(key: string): Promise<void> {
  await localforage.removeItem(key);
}

export async function clearCache(): Promise<void> {
  await localforage.clear();
}

