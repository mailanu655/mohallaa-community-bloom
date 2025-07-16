import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  accuracy?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { user } = useAuth();

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
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
      };

      // Reverse geocode to get city/state
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationData.latitude}&longitude=${locationData.longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        if (data.city && data.principalSubdivision) {
          locationData.city = data.city;
          locationData.state = data.principalSubdivision;
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError);
      }

      setLocation(locationData);
      setPermissionStatus('granted');

      // Update user's location preferences if logged in
      if (user) {
        await supabase
          .from('profiles')
          .update({
            current_latitude: locationData.latitude,
            current_longitude: locationData.longitude,
            current_city: locationData.city,
            current_state: locationData.state,
          })
          .eq('id', user.id);
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
      setPermissionStatus('denied');
      setLoading(false);
      return false;
    }
  };

  const loadSavedLocation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_latitude, current_longitude, current_city, current_state')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.current_latitude && data?.current_longitude) {
        setLocation({
          latitude: data.current_latitude,
          longitude: data.current_longitude,
          city: data.current_city,
          state: data.current_state,
        });
      }
    } catch (err) {
      console.error('Failed to load saved location:', err);
    }
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
  };
};