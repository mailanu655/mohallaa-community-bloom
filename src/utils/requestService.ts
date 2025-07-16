import { supabase } from '@/integrations/supabase/client';
import { ApiErrorHandler } from './errorHandler';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Circuit breaker state
const circuitBreaker = {
  failureCount: 0,
  nextRetryTime: 0,
  isOpen: false,
  threshold: 5,
  timeout: 30000, // 30 seconds
};

// Exponential backoff configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

// Check if circuit breaker is open
const isCircuitBreakerOpen = (): boolean => {
  if (!circuitBreaker.isOpen) return false;
  
  if (Date.now() >= circuitBreaker.nextRetryTime) {
    circuitBreaker.isOpen = false;
    circuitBreaker.failureCount = 0;
    return false;
  }
  
  return true;
};

// Record success/failure for circuit breaker
const recordResult = (success: boolean) => {
  if (success) {
    circuitBreaker.failureCount = 0;
    circuitBreaker.isOpen = false;
  } else {
    circuitBreaker.failureCount++;
    if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
      circuitBreaker.isOpen = true;
      circuitBreaker.nextRetryTime = Date.now() + circuitBreaker.timeout;
    }
  }
};

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay
const calculateDelay = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
};

// Check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Network errors are retryable
  if (ApiErrorHandler.isNetworkError(error)) return true;
  
  // Certain HTTP status codes are retryable
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  // PostgreSQL connection errors are retryable
  if (error.code && ['08000', '08003', '08006', '57P03'].includes(error.code)) {
    return true;
  }
  
  return false;
};

// Execute request with retry logic
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  context: string,
  retryCount = 0
): Promise<T> => {
  try {
    const result = await operation();
    recordResult(true);
    return result;
  } catch (error) {
    recordResult(false);
    
    // Don't retry if circuit breaker is open
    if (isCircuitBreakerOpen()) {
      throw new Error('Service temporarily unavailable');
    }
    
    // Don't retry if max retries reached or error is not retryable
    if (retryCount >= RETRY_CONFIG.maxRetries || !isRetryableError(error)) {
      throw error;
    }
    
    // Calculate delay and retry
    const delay = calculateDelay(retryCount);
    console.warn(`${context} failed (attempt ${retryCount + 1}), retrying in ${delay}ms:`, error);
    
    await sleep(delay);
    return executeWithRetry(operation, context, retryCount + 1);
  }
};

// Generic request function with deduplication
export const makeRequest = async <T>(
  requestFn: () => Promise<{ data: T; error: any }>,
  cacheKey: string,
  context: string = 'Request'
): Promise<T> => {
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    console.log(`Deduplicating request: ${cacheKey}`);
    return pendingRequests.get(cacheKey);
  }
  
  // Check circuit breaker
  if (isCircuitBreakerOpen()) {
    throw new Error('Service temporarily unavailable due to repeated failures');
  }
  
  // Create promise for this request
  const promise = executeWithRetry(async () => {
    const { data, error } = await requestFn();
    
    if (error) {
      throw error;
    }
    
    return data;
  }, context);
  
  // Store promise to deduplicate concurrent requests
  pendingRequests.set(cacheKey, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    // Clean up pending request
    pendingRequests.delete(cacheKey);
  }
};

// Specific request helpers
export const requestService = {
  // Get posts with pagination
  getPosts: async (page: number = 1, limit: number = 15, feedSort: string = 'latest') => {
    const cacheKey = `posts_${feedSort}_${page}_${limit}`;
    
    return makeRequest(
      async () => {
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles!inner(first_name, last_name, avatar_url),
            communities(name, city, state)
          `);
        
        // Apply sorting
        switch (feedSort) {
          case 'latest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'trending':
            query = query
              .order('comment_count', { ascending: false })
              .order('upvotes', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
        
        return query.range((page - 1) * limit, page * limit - 1);
      },
      cacheKey,
      'Get Posts'
    );
  },

  // Get businesses
  getBusinesses: async (limit: number = 5) => {
    const cacheKey = `businesses_${limit}`;
    
    return makeRequest(
      async () => {
        return supabase
          .from('businesses')
          .select('id, name, rating, review_count, category, image_url')
          .order('rating', { ascending: false })
          .limit(limit);
      },
      cacheKey,
      'Get Businesses'
    );
  },

  // Get events
  getEvents: async (limit: number = 5) => {
    const cacheKey = `events_${limit}`;
    
    return makeRequest(
      async () => {
        return supabase
          .from('events')
          .select(`
            *,
            communities(name, city, state),
            profiles!inner(first_name, last_name)
          `)
          .gte('start_date', new Date().toISOString())
          .order('start_date', { ascending: true })
          .limit(limit);
      },
      cacheKey,
      'Get Events'
    );
  },

  // Get marketplace items
  getMarketplaceItems: async (limit: number = 6) => {
    const cacheKey = `marketplace_${limit}`;
    
    return makeRequest(
      async () => {
        return supabase
          .from('marketplace')
          .select(`
            *,
            profiles!inner(first_name, last_name, avatar_url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit);
      },
      cacheKey,
      'Get Marketplace Items'
    );
  },

  // Get personalized feed
  getPersonalizedFeed: async (userId: string, limit: number = 20) => {
    const cacheKey = `personalized_feed_${userId}_${limit}`;
    
    return makeRequest(
      async () => {
        return supabase.rpc('calculate_personalized_feed', {
          target_user_id: userId,
          limit_count: limit,
          offset_count: 0
        });
      },
      cacheKey,
      'Get Personalized Feed'
    );
  },

  // Get trending topics
  getTrendingTopics: async () => {
    const cacheKey = 'trending_topics';
    
    return makeRequest(
      async () => {
        return supabase
          .from('posts')
          .select('content, tags, created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });
      },
      cacheKey,
      'Get Trending Topics'
    );
  },

  // Get nearby posts
  getNearbyPosts: async (lat: number, lng: number, radiusMiles: number = 10) => {
    const cacheKey = `nearby_posts_${lat}_${lng}_${radiusMiles}`;
    
    return makeRequest(
      async () => {
        return supabase.rpc('get_nearby_posts', {
          user_lat: lat,
          user_lng: lng,
          radius_miles: radiusMiles,
          limit_count: 20,
          offset_count: 0,
        });
      },
      cacheKey,
      'Get Nearby Posts'
    );
  },

  // Get posts by location
  getPostsByLocation: async (city: string, state: string, limit: number = 20) => {
    const cacheKey = `posts_by_location_${city}_${state}_${limit}`;
    
    return makeRequest(
      async () => {
        return supabase.rpc('get_posts_by_location', {
          user_city: city,
          user_state: state,
          limit_count: limit,
          offset_count: 0,
        });
      },
      cacheKey,
      'Get Posts by Location'
    );
  },
};

// Clear cache utility
export const clearRequestCache = () => {
  pendingRequests.clear();
};

// Get circuit breaker status
export const getCircuitBreakerStatus = () => ({
  isOpen: circuitBreaker.isOpen,
  failureCount: circuitBreaker.failureCount,
  nextRetryTime: circuitBreaker.nextRetryTime,
});