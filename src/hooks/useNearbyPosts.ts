import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LocationData } from './useLocation';
import { requestService } from '@/utils/requestService';
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

export const useNearbyPosts = (location: LocationData | null, radiusMiles: number = 10) => {
  const [posts, setPosts] = useState<NearbyPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNearbyPosts = async () => {
    if (!location) return;

    setLoading(true);
    setError(null);

    try {
      // First try to get posts with exact coordinates using the new request service
      const nearbyData = await requestService.getNearbyPosts(
        location.latitude,
        location.longitude,
        radiusMiles
      );

      let allPosts = (nearbyData || []) as NearbyPost[];

      // If we have city/state and not many nearby posts, add city/state posts
      if (location.city && location.state && allPosts.length < 10) {
        const cityData = await requestService.getPostsByLocation(
          location.city,
          location.state,
          20 - allPosts.length
        );

        // Filter out duplicates and add city posts
        const cityPosts = (cityData || []).filter(
          cityPost => !allPosts.some(nearbyPost => nearbyPost.id === cityPost.id)
        ) as NearbyPost[];

        allPosts = [...allPosts, ...cityPosts] as NearbyPost[];
      }

      // If still not enough posts, get community posts
      if (allPosts.length < 10) {
        const { data: communityData, error: communityError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_author_id_fkey(first_name, last_name, avatar_url),
            communities(name, city, state)
          `)
          .not('id', 'in', `(${allPosts.map(p => p.id).join(',') || 'null'})`)
          .order('created_at', { ascending: false })
          .limit(20 - allPosts.length);

        if (communityError) throw communityError;

        const communityPosts = (communityData || []).map(post => ({
          ...post,
          distance_miles: undefined,
        })) as NearbyPost[];

        allPosts = [...allPosts, ...communityPosts] as NearbyPost[];
      }

      setPosts(allPosts);
    } catch (err: any) {
      const apiError = ApiErrorHandler.handle(err, 'Nearby Posts');
      setError(apiError.message);
      console.error('Failed to fetch nearby posts:', apiError);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByLocation = async (city: string, state: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await requestService.getPostsByLocation(city, state, 20);
      setPosts((data || []) as NearbyPost[]);
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
  }, [location, radiusMiles]);

  return {
    posts,
    loading,
    error,
    fetchNearbyPosts,
    fetchPostsByLocation,
  };
};