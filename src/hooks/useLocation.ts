import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNeighborhoods, Neighborhood } from './useNeighborhoods';

export interface LocationData {
  neighborhood: Neighborhood;
  city: string;
  state: string;
  source: 'neighborhood_selection';
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const { user } = useAuth();
  const { selectedNeighborhood, selectNeighborhood } = useNeighborhoods();

  const requestLocation = async (): Promise<boolean> => {
    // This method is now simplified - just prompt for neighborhood selection
    setError('Please select your neighborhood to continue');
    return false;
  };

  const loadSavedLocation = async () => {
    // Load from neighborhood selection instead
    if (selectedNeighborhood) {
      const locationData: LocationData = {
        neighborhood: selectedNeighborhood,
        city: selectedNeighborhood.city,
        state: selectedNeighborhood.state,
        source: 'neighborhood_selection'
      };
      setLocation(locationData);
      setLocationConfirmed(true);
    }
  };

  const setNeighborhoodLocation = async (neighborhood: Neighborhood): Promise<boolean> => {
    if (loading) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await selectNeighborhood(neighborhood);
      
      const locationData: LocationData = {
        neighborhood,
        city: neighborhood.city,
        state: neighborhood.state,
        source: 'neighborhood_selection'
      };
      
      setLocation(locationData);
      setLocationConfirmed(true);
      return true;
      
    } catch (err: any) {
      console.error('Failed to set neighborhood location:', err);
      setError('Failed to select neighborhood. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const confirmLocation = () => {
    setLocationConfirmed(true);
  };

  const clearLocationCache = () => {
    setLocation(null);
    setLocationConfirmed(false);
    setError(null);
  };

  // Load saved location on neighborhood change
  useEffect(() => {
    loadSavedLocation();
  }, [selectedNeighborhood]);

  return {
    location,
    loading,
    error,
    locationConfirmed,
    selectedNeighborhood,
    requestLocation,
    setNeighborhoodLocation,
    confirmLocation,
    clearLocationCache,
  };
};