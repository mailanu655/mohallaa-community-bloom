import LocationCacheService from './locationCache';

interface GeocodeResult {
  city?: string;
  state?: string;
  neighborhood?: string;
  zipcode?: string;
  success: boolean;
  fromCache: boolean;
  provider?: string;
  accuracy?: 'high' | 'medium' | 'low';
  confidence?: number;
  error?: string;
}

interface GeocodingProvider {
  name: string;
  priority: number;
  endpoint: (lat: number, lng: number) => string;
  parser: (data: any) => Partial<GeocodeResult>;
  attribution: string;
}

class GeocodingService {
  private static readonly TIMEOUT_MS = 8000;
  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAY = 1000;

  private static readonly PROVIDERS: GeocodingProvider[] = [
    {
      name: 'BigDataCloud',
      priority: 1,
      endpoint: (lat: number, lng: number) => 
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      parser: (data: any) => ({
        city: data.city || data.locality,
        state: data.principalSubdivision || data.principalSubdivisionCode,
        neighborhood: data.neighbourhood || data.suburb || data.district,
        zipcode: data.postcode,
        accuracy: data.confidence > 0.8 ? 'high' : data.confidence > 0.5 ? 'medium' : 'low',
        confidence: data.confidence || 0.5
      }),
      attribution: 'BigDataCloud'
    },
    {
      name: 'OpenStreetMap Nominatim',
      priority: 2,
      endpoint: (lat: number, lng: number) => 
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      parser: (data: any) => ({
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state || data.address?.region,
        neighborhood: data.address?.neighbourhood || data.address?.suburb || data.address?.quarter,
        zipcode: data.address?.postcode,
        accuracy: data.importance > 0.7 ? 'high' : data.importance > 0.4 ? 'medium' : 'low',
        confidence: data.importance || 0.3
      }),
      attribution: '© OpenStreetMap contributors'
    }
  ];

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
    try {
      // Validate coordinates first
      if (!latitude || !longitude || 
          latitude < -90 || latitude > 90 || 
          longitude < -180 || longitude > 180) {
        console.error('Invalid coordinates for geocoding:', { latitude, longitude });
        return {
          success: false,
          fromCache: false,
          error: 'Invalid coordinates provided'
        };
      }

      console.log(`Reverse geocoding coordinates: ${latitude}, ${longitude}`);

      // Check cache first
      const cached = LocationCacheService.get(latitude, longitude);
      if (cached?.city && cached?.state) {
        console.log('Geocoding cache hit:', cached);
        return {
          city: cached.city,
          state: cached.state,
          neighborhood: cached.neighborhood,
          zipcode: cached.zipcode,
          success: true,
          fromCache: true
        };
      }

      // Try providers in order of priority
      const sortedProviders = this.PROVIDERS.sort((a, b) => a.priority - b.priority);

      for (const provider of sortedProviders) {
        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
          try {
            const url = provider.endpoint(latitude, longitude);
            console.log(`Trying ${provider.name} (attempt ${attempt + 1}):`, url);
            
            const response = await this.fetchWithTimeout(url, this.TIMEOUT_MS);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Raw response from ${provider.name}:`, data);
            
            const parsed = provider.parser(data);
            console.log(`Parsed result from ${provider.name}:`, parsed);

            if (parsed.city && parsed.state) {
              // Additional validation of parsed result
              if (parsed.city.toLowerCase() === 'unknown' || 
                  parsed.state.toLowerCase() === 'unknown' ||
                  parsed.city.length < 2 || 
                  parsed.state.length < 2) {
                console.warn(`${provider.name} returned invalid location data:`, parsed);
                continue;
              }
              
              // Cache the successful result
              LocationCacheService.set(latitude, longitude, {
                latitude,
                longitude,
                city: parsed.city,
                state: parsed.state,
                neighborhood: parsed.neighborhood,
                zipcode: parsed.zipcode,
                accuracy: parsed.confidence
              });

              return {
                city: parsed.city,
                state: parsed.state,
                neighborhood: parsed.neighborhood,
                zipcode: parsed.zipcode,
                success: true,
                fromCache: false,
                provider: provider.name,
                accuracy: parsed.accuracy,
                confidence: parsed.confidence
              };
            }

            throw new Error('Incomplete geocoding data received');
          } catch (error) {
            console.warn(`${provider.name} geocoding attempt ${attempt + 1} failed:`, error);
            
            if (attempt < this.MAX_RETRIES - 1) {
              await this.delay(this.RETRY_DELAY * Math.pow(2, attempt));
            }
          }
        }
      }

      // All providers failed
      console.error('All geocoding providers failed for coordinates:', latitude, longitude);
      return {
        success: false,
        fromCache: false,
        error: 'All geocoding providers failed'
      };
      
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        fromCache: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default GeocodingService;