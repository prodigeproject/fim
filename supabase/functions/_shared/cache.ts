// =====================================================
// EDGE FUNCTION CACHE LAYER
// TTL-based in-memory caching for Edge Functions
// =====================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

const CACHE = new Map<string, CacheEntry<unknown>>();

// Default TTL: 5 minutes
const DEFAULT_TTL_SECONDS = 300;

/**
 * Get data from cache or fetch it
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not in cache
 * @param ttlSeconds - Time to live in seconds (default: 300)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
  const cached = CACHE.get(key) as CacheEntry<T> | undefined;
  
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[Cache] HIT: ${key}`);
    return cached.data;
  }

  console.log(`[Cache] MISS: ${key}`);
  const data = await fetcher();
  
  CACHE.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    createdAt: Date.now(),
  });

  return data;
}

/**
 * Set data in cache directly
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttlSeconds - Time to live in seconds
 */
export function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): void {
  CACHE.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    createdAt: Date.now(),
  });
  console.log(`[Cache] SET: ${key} (TTL: ${ttlSeconds}s)`);
}

/**
 * Get data from cache without fetching
 * @param key - Cache key
 */
export function getFromCache<T>(key: string): T | null {
  const cached = CACHE.get(key) as CacheEntry<T> | undefined;
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  return null;
}

/**
 * Invalidate cache entries by key or pattern
 * @param keyPattern - Key or pattern to match (if empty, clears all)
 */
export function invalidateCache(keyPattern?: string): number {
  if (!keyPattern) {
    const count = CACHE.size;
    CACHE.clear();
    console.log(`[Cache] CLEARED: ${count} entries`);
    return count;
  }

  let deletedCount = 0;
  for (const key of CACHE.keys()) {
    if (key.includes(keyPattern)) {
      CACHE.delete(key);
      deletedCount++;
    }
  }
  console.log(`[Cache] INVALIDATED: ${deletedCount} entries matching "${keyPattern}"`);
  return deletedCount;
}

/**
 * Delete a specific cache entry
 * @param key - Cache key to delete
 */
export function deleteCache(key: string): boolean {
  const deleted = CACHE.delete(key);
  if (deleted) {
    console.log(`[Cache] DELETED: ${key}`);
  }
  return deleted;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: { key: string; expiresIn: number; age: number }[];
} {
  const now = Date.now();
  const entries: { key: string; expiresIn: number; age: number }[] = [];

  for (const [key, entry] of CACHE.entries()) {
    const cacheEntry = entry as CacheEntry<unknown>;
    entries.push({
      key,
      expiresIn: Math.max(0, Math.round((cacheEntry.expiresAt - now) / 1000)),
      age: Math.round((now - cacheEntry.createdAt) / 1000),
    });
  }

  return {
    size: CACHE.size,
    entries,
  };
}

/**
 * Cleanup expired cache entries
 */
export function cleanupExpiredCache(): number {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of CACHE.entries()) {
    const cacheEntry = entry as CacheEntry<unknown>;
    if (cacheEntry.expiresAt <= now) {
      CACHE.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Cache] CLEANUP: Removed ${cleanedCount} expired entries`);
  }

  return cleanedCount;
}

// Common cache key generators
export const CacheKeys = {
  dashboardStats: () => "dashboard:stats",
  registrationSettings: () => "registration:settings",
  emailTemplate: (name: string) => `email:template:${name}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  articleById: (id: string) => `article:${id}`,
  articleList: (page: number, limit: number) => `articles:list:${page}:${limit}`,
};
