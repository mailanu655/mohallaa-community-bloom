import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LocationData } from './useLocation';
import { ApiErrorHandler } from '@/utils/errorHandler';

export interface NearbyPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  community_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  post_type: string;
  tags: string[];
  media_urls: string[];
  media_type: string;
  rich_content: any;
  is_pinned: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  location_name?: string;
  distance_miles?: number;
}

export const useNearbyPosts = (location: LocationData | null) => {
  const [posts, setPosts] = useState<NearbyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNearbyPosts = async () => {
    if (!location?.neighborhood) return;

    setLoading(true);
    setError(null);

    try {
      // Use the new neighborhood-based function
      const { data, error: rpcError } = await supabase.rpc('get_posts_by_neighborhood', {
        neighborhood_uuid: location.neighborhood.id,
        include_metro: true,
        limit_count: 20,
        offset_count: 0,
      });

      if (rpcError) throw rpcError;

      const neighborhoodPosts = (data || []).map(post => ({
        ...post,
        distance_miles: undefined, // Not applicable for neighborhood-based filtering
      })) as NearbyPost[];

      setPosts(neighborhoodPosts);
    } catch (err: any) {
      const apiError = ApiErrorHandler.handle(err, 'Neighborhood Posts');
      setError(apiError.message);
      console.error('Failed to fetch neighborhood posts:', apiError);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByLocation = async (city: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fallback for legacy city/state based search
      const { data, error: queryError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .or(`city.ilike.%${city}%,state.ilike.%${state}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (queryError) throw queryError;

      const posts = (data || []).map(post => ({
        ...post,
        distance_miles: undefined,
      })) as NearbyPost[];

      setPosts(posts);
    } catch (err: any) {
      const apiError = ApiErrorHandler.handle(err, 'Posts by Location');
      setError(apiError.message);
      console.error('Failed to fetch posts by location:', apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyPosts();
    }
  }, [location]);

  return {
    posts,
    loading,
    error,
    fetchNearbyPosts,
    fetchPostsByLocation,
  };
};