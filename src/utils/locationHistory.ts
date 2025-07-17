import { supabase } from '@/integrations/supabase/client';

interface LocationHistoryEntry {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  accuracy?: number;
  detection_method: 'auto' | 'manual' | 'ip';
  created_at: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  accuracy?: number;
}

class LocationHistoryService {
  private static readonly SIGNIFICANT_DISTANCE_KM = 1; // Only track if moved more than 1km

  static async addEntry(
    location: LocationData, 
    detectionMethod: 'auto' | 'manual' | 'ip' = 'auto'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if this is a significant location change
      const isSignificant = await this.isSignificantLocationChange(location);
      if (!isSignificant) return;

      const { error } = await supabase
        .from('location_history')
        .insert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          state: location.state,
          accuracy: location.accuracy,
          detection_method: detectionMethod
        });

      if (error) {
        console.warn('Failed to save location history:', error);
      }
    } catch (error) {
      console.warn('Error adding location history entry:', error);
    }
  }

  static async getHistory(limit: number = 50): Promise<LocationHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch location history:', error);
        return [];
      }

      return (data as LocationHistoryEntry[]) || [];
    } catch (error) {
      console.warn('Error fetching location history:', error);
      return [];
    }
  }

  static async getFrequentLocations(): Promise<LocationHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all location history and process client-side
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', user.id)
        .not('city', 'is', null)
        .not('state', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch frequent locations:', error);
        return [];
      }

      if (!data) return [];

      // Group by city/state and count frequency
      const locationMap = new Map<string, { count: number; entry: LocationHistoryEntry }>();
      
      data.forEach(entry => {
        const key = `${entry.city}-${entry.state}`;
        if (locationMap.has(key)) {
          locationMap.get(key)!.count++;
        } else {
          locationMap.set(key, { count: 1, entry: entry as LocationHistoryEntry });
        }
      });

      // Sort by frequency and return top 5
      return Array.from(locationMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.entry);
    } catch (error) {
      console.warn('Error fetching frequent locations:', error);
      return [];
    }
  }

  static async clearHistory(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('location_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.warn('Failed to clear location history:', error);
      }
    } catch (error) {
      console.warn('Error clearing location history:', error);
    }
  }

  private static async isSignificantLocationChange(newLocation: LocationData): Promise<boolean> {
    try {
      const recent = await this.getHistory(1);
      if (recent.length === 0) return true;

      const lastLocation = recent[0];
      const distance = this.calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
      );

      return distance >= this.SIGNIFICANT_DISTANCE_KM;
    } catch (error) {
      console.warn('Error checking location significance:', error);
      return true; // Default to saving if we can't check
    }
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

export default LocationHistoryService;