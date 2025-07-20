interface CachedLocation {
  data: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    neighborhood?: string;
    zipcode?: string;
    accuracy?: number;
  };
  timestamp: number;
  expires: number;
}

class LocationCacheService {
  private static readonly CACHE_KEY = 'mohallaa_location_cache';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly COORDINATE_PRECISION = 3; // ~100m accuracy

  static roundCoordinate(coord: number): number {
    return Math.round(coord * Math.pow(10, this.COORDINATE_PRECISION)) / Math.pow(10, this.COORDINATE_PRECISION);
  }

  static getCacheKey(lat: number, lng: number): string {
    const roundedLat = this.roundCoordinate(lat);
    const roundedLng = this.roundCoordinate(lng);
    return `${roundedLat},${roundedLng}`;
  }

  static get(lat: number, lng: number): CachedLocation['data'] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cache: Record<string, CachedLocation> = JSON.parse(cached);
      const key = this.getCacheKey(lat, lng);
      const entry = cache[key];

      if (!entry || Date.now() > entry.expires) {
        this.remove(lat, lng);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to read location cache:', error);
      return null;
    }
  }

  static set(lat: number, lng: number, data: CachedLocation['data']): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      const cache: Record<string, CachedLocation> = cached ? JSON.parse(cached) : {};
      
      const key = this.getCacheKey(lat, lng);
      const now = Date.now();
      
      cache[key] = {
        data,
        timestamp: now,
        expires: now + this.CACHE_TTL
      };

      // Clean expired entries
      Object.keys(cache).forEach(k => {
        if (Date.now() > cache[k].expires) {
          delete cache[k];
        }
      });

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  }

  static remove(lat: number, lng: number): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return;

      const cache: Record<string, CachedLocation> = JSON.parse(cached);
      const key = this.getCacheKey(lat, lng);
      delete cache[key];
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to remove from location cache:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear location cache:', error);
    }
  }
}

export default LocationCacheService;