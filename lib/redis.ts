import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Upstash Redis environment variables are missing. Caching will be disabled.');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache helper to wrap async functions
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600 // 1 hour default
): Promise<T> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return fetcher();

  try {
    const cached = await redis.get(key);
    if (cached) {
      // Redis might return a string if it was serialized, or an object if it was auto-parsed
      return typeof cached === 'string' ? JSON.parse(cached) : cached as T;
    }

    const freshData = await fetcher();
    await redis.set(key, JSON.stringify(freshData), { ex: ttl });
    return freshData;
  } catch (err) {
    console.error(`Redis Error [${key}]:`, err);
    return fetcher(); // Fallback to DB on error
  }
}
