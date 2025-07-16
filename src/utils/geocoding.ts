import LocationCacheService from './locationCache';

interface GeocodeResult {
  city?: string;
  state?: string;
  success: boolean;
  fromCache: boolean;
}

class GeocodingService {
  private static readonly TIMEOUT_MS = 8000;
  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAY = 1000;

  private static async fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    // Check cache first
    const cached = LocationCacheService.get(latitude, longitude);
    if (cached?.city && cached?.state) {
      return {
        city: cached.city,
        state: cached.state,
        success: true,
        fromCache: true
      };
    }

    // Try multiple services with retry logic
    const services = [
      {
        name: 'BigDataCloud',
        url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        parser: (data: any) => ({
          city: data.city || data.locality,
          state: data.principalSubdivision || data.principalSubdivisionCode
        })
      }
    ];

    for (const service of services) {
      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          const response = await this.fetchWithTimeout(service.url, this.TIMEOUT_MS);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          const parsed = service.parser(data);

          if (parsed.city && parsed.state) {
            // Cache the successful result
            LocationCacheService.set(latitude, longitude, {
              latitude,
              longitude,
              city: parsed.city,
              state: parsed.state
            });

            return {
              city: parsed.city,
              state: parsed.state,
              success: true,
              fromCache: false
            };
          }

          throw new Error('Incomplete geocoding data received');
        } catch (error) {
          console.warn(`${service.name} geocoding attempt ${attempt + 1} failed:`, error);
          
          if (attempt < this.MAX_RETRIES - 1) {
            await this.delay(this.RETRY_DELAY * Math.pow(2, attempt));
          }
        }
      }
    }

    // All services failed
    return {
      success: false,
      fromCache: false
    };
  }
}

export default GeocodingService;