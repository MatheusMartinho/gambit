const { getRedisClient, isRedisConnected } = require('./redis');
const logger = require('../utils/logger');

/**
 * Cache Manager - Abstração para gerenciamento de cache
 */
class CacheManager {
  /**
   * Get value from cache
   */
  static async get(key) {
    try {
      if (!isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const client = getRedisClient();
      const value = await client.get(key);

      if (value) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(value);
      }

      logger.debug(`Cache miss: ${key}`);
      return null;

    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  static async set(key, value, ttl = 3600) {
    try {
      if (!isRedisConnected()) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }

      const client = getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));

      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
      return true;

    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async del(key) {
    try {
      if (!isRedisConnected()) {
        return false;
      }

      const client = getRedisClient();
      await client.del(key);

      logger.debug(`Cache deleted: ${key}`);
      return true;

    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  static async delPattern(pattern) {
    try {
      if (!isRedisConnected()) {
        return 0;
      }

      const client = getRedisClient();
      const keys = await client.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await client.del(keys);

      logger.debug(`Cache deleted ${keys.length} keys matching: ${pattern}`);
      return keys.length;

    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key) {
    try {
      if (!isRedisConnected()) {
        return false;
      }

      const client = getRedisClient();
      const exists = await client.exists(key);

      return exists === 1;

    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set (fetch if not in cache)
   */
  static async getOrSet(key, fetchFunction, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const data = await fetchFunction();

      // Save to cache
      await this.set(key, data, ttl);

      return data;

    } catch (error) {
      logger.error(`Cache getOrSet error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment counter
   */
  static async incr(key, ttl = null) {
    try {
      if (!isRedisConnected()) {
        return 1;
      }

      const client = getRedisClient();
      const value = await client.incr(key);

      if (ttl && value === 1) {
        await client.expire(key, ttl);
      }

      return value;

    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return 1;
    }
  }

  /**
   * Get TTL of a key
   */
  static async ttl(key) {
    try {
      if (!isRedisConnected()) {
        return -1;
      }

      const client = getRedisClient();
      return await client.ttl(key);

    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Flush all cache
   */
  static async flushAll() {
    try {
      if (!isRedisConnected()) {
        return false;
      }

      const client = getRedisClient();
      await client.flushAll();

      logger.warn('Cache: All keys flushed');
      return true;

    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }
}

module.exports = CacheManager;
