
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCachedData, cacheKeys } from '@/utils/cache';

interface UserCommunity {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  privacy_type: string;
  city: string;
  state: string;
}

export const useUserCommunities = () => {
  const { user } = useAuth();
  
  const fetchUserCommunities = async (): Promise<UserCommunity[]> => {
    if (!user) {
      console.log('No user found, returning empty communities array');
      return [];
    }
    
    console.log('Fetching communities for user:', user.id);
    
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        communities (
          id,
          name,
          description,
          member_count,
          privacy_type,
          city,
          state
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching user communities:', error);
      throw error;
    }
    
    const communities = data?.map(item => item.communities).filter(Boolean) as UserCommunity[] || [];
    console.log('Fetched user communities:', communities);
    
    return communities;
  };

  const {
    data: communities,
    loading,
    error,
    refresh
  } = useCachedData({
    cacheKey: user ? cacheKeys.userCommunities(user.id) : 'no-user',
    fetchFn: fetchUserCommunities,
    ttlSeconds: 300, // 5 minutes
    dependencies: [user?.id]
  });

  return {
    communities: communities || [],
    loading,
    error,
    refresh
  };
};
