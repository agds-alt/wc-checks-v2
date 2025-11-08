// Upstash Redis Client (Serverless-optimized)
import { Redis } from '@upstash/redis';

// Singleton Redis client for Upstash
let redis: Redis | null = null;

export function getUpstashRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }

  return redis;
}

// Cache service with Upstash Redis
export class UpstashCacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour

  constructor() {
    this.redis = getUpstashRedis();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.redis.set(key, value, {
        ex: ttl || this.defaultTTL,
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async setSession(sessionId: string, data: any, ttl?: number): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, data, ttl || 86400); // 24 hours default
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = `session:${sessionId}`;
    return this.get<T>(key);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }

  async extendSession(sessionId: string, ttl: number): Promise<void> {
    const key = `session:${sessionId}`;
    await this.redis.expire(key, ttl);
  }
}

// Export singleton instance
export const upstashCache = new UpstashCacheService();
