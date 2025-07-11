// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }
}

// Create singleton instance
export const cache = new InMemoryCache();

// Cache key generators
export const cacheKeys = {
  community: (id: string) => `community:${id}`,
  communityMembers: (id: string) => `community:${id}:members`,
  communityPosts: (id: string) => `community:${id}:posts`,
  userProfile: (id: string) => `profile:${id}`,
  userCommunities: (id: string) => `user:${id}:communities`,
  eventAttendees: (id: string) => `event:${id}:attendees`,
  searchResults: (query: string, type?: string) => `search:${query}${type ? `:${type}` : ''}`,
  notifications: (userId: string) => `notifications:${userId}`,
};

// Cached API function wrapper
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  getKey: (...args: T) => string,
  ttlSeconds: number = 300
) {
  return async (...args: T): Promise<R> => {
    const key = getKey(...args);
    
    // Try to get from cache first
    const cached = cache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      cache.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// React hook for cached data
import { useState, useEffect, useCallback } from 'react';

interface UseCachedDataOptions<T> {
  cacheKey: string;
  fetchFn: () => Promise<T>;
  ttlSeconds?: number;
  dependencies?: any[];
}

export function useCachedData<T>({
  cacheKey,
  fetchFn,
  ttlSeconds = 300,
  dependencies = []
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (useCache) {
        const cached = cache.get<T>(cacheKey);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // Fetch fresh data
      const result = await fetchFn();
      
      // Cache the result
      cache.set(cacheKey, result, ttlSeconds);
      setData(result);
      
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, ttlSeconds]);

  const invalidate = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    refetch: refresh
  };
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate all cache entries matching a pattern
  invalidatePattern: (pattern: string) => {
    const regex = new RegExp(pattern);
    const keysToDelete = Array.from(cache.getStats().keys).filter(key => 
      regex.test(key)
    );
    
    keysToDelete.forEach(key => cache.delete(key));
    return keysToDelete.length;
  },

  // Invalidate community-related cache
  invalidateCommunity: (communityId: string) => {
    cache.delete(cacheKeys.community(communityId));
    cache.delete(cacheKeys.communityMembers(communityId));
    cache.delete(cacheKeys.communityPosts(communityId));
  },

  // Invalidate user-related cache
  invalidateUser: (userId: string) => {
    cache.delete(cacheKeys.userProfile(userId));
    cache.delete(cacheKeys.userCommunities(userId));
    cache.delete(cacheKeys.notifications(userId));
  },

  // Invalidate search cache
  invalidateSearch: () => {
    cacheInvalidation.invalidatePattern('^search:');
  }
};