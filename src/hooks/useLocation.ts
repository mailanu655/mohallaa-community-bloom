import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ApiErrorHandler } from '@/utils/errorHandler';
import GeocodingService from '@/utils/geocoding';
import LocationCacheService from '@/utils/locationCache';
import LocationHistoryService from '@/utils/locationHistory';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  accuracy?: number;
  fromCache?: boolean;
  provider?: string;
  accuracyLevel?: 'high' | 'medium' | 'low';
  confidence?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { user } = useAuth();

  const requestLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      const error = ApiErrorHandler.handleLocationError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      setError(error.message);
      setPermissionStatus('denied');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current position with enhanced timeout handling
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject({ code: 3, message: 'Timeout: Location request took too long' });
        }, 12000); // 12 second timeout

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        fromCache: false
      };

      // Enhanced reverse geocoding with caching and error handling
      try {
        const geocodeResult = await GeocodingService.reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );

        if (geocodeResult.success) {
          locationData.city = geocodeResult.city;
          locationData.state = geocodeResult.state;
          locationData.fromCache = geocodeResult.fromCache;
          locationData.provider = geocodeResult.provider;
          locationData.accuracyLevel = geocodeResult.accuracy;
          locationData.confidence = geocodeResult.confidence;
        } else {
          // Geocoding failed but location still works
          console.warn('Geocoding failed, but location coordinates are available');
        }
      } catch (geocodeError) {
        // Don't fail the entire location request for geocoding errors
        console.warn('Geocoding service unavailable:', geocodeError);
        ApiErrorHandler.showLocationToast({ message: 'geocoding failed' });
      }

      setLocation(locationData);
      setPermissionStatus('granted');

      // Update user's location preferences and add to history if logged in
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({
              current_latitude: locationData.latitude,
              current_longitude: locationData.longitude,
              current_city: locationData.city,
              current_state: locationData.state,
            })
            .eq('id', user.id);

          // Add to location history
          await LocationHistoryService.addEntry(locationData, 'auto');
        } catch (dbError) {
          console.warn('Failed to save location to profile:', dbError);
        }
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      const locationError = ApiErrorHandler.handleLocationError(err);
      setError(locationError.message);
      setPermissionStatus('denied');
      setLoading(false);
      
      // Don't show toast for permission denied to avoid double messaging
      if (locationError.type !== 'permission') {
        ApiErrorHandler.showLocationToast(err);
      }
      
      return false;
    }
  };

  const loadSavedLocation = async (): Promise<void> => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_latitude, current_longitude, current_city, current_state')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.current_latitude && data?.current_longitude) {
        setLocation({
          latitude: data.current_latitude,
          longitude: data.current_longitude,
          city: data.current_city,
          state: data.current_state,
          fromCache: true
        });
      }
    } catch (err) {
      console.error('Failed to load saved location:', err);
    }
  };

  const setManualLocation = async (city: string, state: string): Promise<boolean> => {
    if (!city || !state) {
      setError('City and state are required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to geocode the manual location to get coordinates
      const geocodeResult = await GeocodingService.reverseGeocode(0, 0); // This will fail, but we'll handle it
      
      // For manual locations, we'll use approximate coordinates based on city/state
      // In a real implementation, you'd want to use a forward geocoding service
      const locationData: LocationData = {
        latitude: 0, // Would be resolved by forward geocoding
        longitude: 0, // Would be resolved by forward geocoding
        city,
        state,
        accuracy: 0,
        fromCache: false,
        provider: 'manual',
        accuracyLevel: 'low'
      };

      setLocation(locationData);
      setPermissionStatus('granted');

      // Update user's location preferences and add to history if logged in
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({
              current_city: locationData.city,
              current_state: locationData.state,
            })
            .eq('id', user.id);

          // Add to location history
          await LocationHistoryService.addEntry(locationData, 'manual');
        } catch (dbError) {
          console.warn('Failed to save manual location to profile:', dbError);
        }
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setError('Failed to set manual location');
      setLoading(false);
      return false;
    }
  };

  const clearLocationCache = (): void => {
    LocationCacheService.clear();
    setLocation(null);
    setPermissionStatus('prompt');
    setError(null);
  };

  useEffect(() => {
    if (user) {
      loadSavedLocation();
    }
  }, [user]);

  return {
    location,
    loading,
    error,
    permissionStatus,
    requestLocation,
    loadSavedLocation,
    clearLocationCache,
    setManualLocation,
  };
};