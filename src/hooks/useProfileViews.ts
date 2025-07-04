import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileView {
  id: string;
  profile_id: string;
  viewer_id: string;
  viewed_at: string;
  viewer?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    profession?: string;
  };
}

interface ProfileViewStats {
  totalViews: number;
  uniqueViewers: number;
  recentViews: ProfileView[];
  topViewers: Array<{
    viewer: any;
    viewCount: number;
  }>;
}

export const useProfileViews = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track a profile view
  const trackProfileView = async (profileId: string) => {
    if (!user || user.id === profileId) return;

    try {
      // Insert view record (will be deduplicated by unique constraint per day)
      await supabase
        .from('profile_views')
        .insert({
          profile_id: profileId,
          viewer_id: user.id
        });
    } catch (error) {
      // Silently handle duplicate entries (same user viewing same profile on same day)
      console.debug('Profile view tracking:', error);
    }
  };

  // Get profile view analytics for the current user
  const fetchProfileViewStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all views for current user's profile
      const { data: views, error } = await supabase
        .from('profile_views')
        .select(`
          id,
          profile_id,
          viewer_id,
          viewed_at,
          viewer:profiles!profile_views_viewer_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url,
            profession
          )
        `)
        .eq('profile_id', user.id)
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      const profileViews = views || [];

      // Calculate stats
      const totalViews = profileViews.length;
      const uniqueViewers = new Set(profileViews.map(v => v.viewer_id)).size;
      const recentViews = profileViews.slice(0, 10);

      // Calculate top viewers
      const viewerCounts = profileViews.reduce((acc, view) => {
        const viewerId = view.viewer_id;
        acc[viewerId] = (acc[viewerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topViewers = Object.entries(viewerCounts)
        .map(([viewerId, count]) => ({
          viewer: profileViews.find(v => v.viewer_id === viewerId)?.viewer,
          viewCount: count
        }))
        .filter(item => item.viewer)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

      setStats({
        totalViews,
        uniqueViewers,
        recentViews: recentViews as ProfileView[],
        topViewers
      });
    } catch (error) {
      console.error('Error fetching profile view stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileViewStats();
    }
  }, [user]);

  return {
    stats,
    isLoading,
    trackProfileView,
    refreshStats: fetchProfileViewStats
  };
};