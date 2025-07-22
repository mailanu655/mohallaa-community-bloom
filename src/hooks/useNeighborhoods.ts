import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
  metro_area: string | null;
  population: number | null;
  is_popular: boolean;
}

export interface NeighborhoodSearchResult extends Neighborhood {
  relevance?: number;
}

export const useNeighborhoods = () => {
  const [popularNeighborhoods, setPopularNeighborhoods] = useState<Neighborhood[]>([]);
  const [searchResults, setSearchResults] = useState<NeighborhoodSearchResult[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load popular neighborhoods
  const loadPopularNeighborhoods = async () => {
    try {
      const { data, error } = await supabase.rpc('get_popular_neighborhoods', {
        limit_count: 20
      });

      if (error) throw error;
      setPopularNeighborhoods(data?.map(n => ({ 
        ...n, 
        is_popular: true 
      })) || []);
    } catch (err: any) {
      console.error('Failed to load popular neighborhoods:', err);
      setError(err.message);
    }
  };

  // Search neighborhoods
  const searchNeighborhoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_neighborhoods', {
        search_query: query,
        limit_count: 10
      });

      if (error) throw error;
      setSearchResults(data?.map(n => ({ 
        ...n, 
        is_popular: false 
      })) || []);
    } catch (err: any) {
      console.error('Failed to search neighborhoods:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load user's selected neighborhood from profile
  const loadUserNeighborhood = async () => {
    if (!user) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          selected_neighborhood_id,
          neighborhoods!selected_neighborhood_id (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.neighborhoods) {
        setSelectedNeighborhood(profile.neighborhoods as any);
      }
    } catch (err: any) {
      console.error('Failed to load user neighborhood:', err);
    }
  };

  // Save selected neighborhood to user profile
  const selectNeighborhood = async (neighborhood: Neighborhood) => {
    if (!user) {
      setSelectedNeighborhood(neighborhood);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          selected_neighborhood_id: neighborhood.id,
          current_city: neighborhood.city,
          current_state: neighborhood.state,
          current_neighborhood: neighborhood.name,
        })
        .eq('id', user.id);

      if (error) throw error;
      setSelectedNeighborhood(neighborhood);
    } catch (err: any) {
      console.error('Failed to save selected neighborhood:', err);
      setError(err.message);
      throw err;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPopularNeighborhoods();
    loadUserNeighborhood();
  }, [user]);

  return {
    popularNeighborhoods,
    searchResults,
    selectedNeighborhood,
    loading,
    error,
    searchNeighborhoods,
    selectNeighborhood,
    loadPopularNeighborhoods,
  };
};