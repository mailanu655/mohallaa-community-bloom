
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
    if (!user) return [];
    
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
    
    if (error) throw error;
    
    return data?.map(item => item.communities).filter(Boolean) || [];
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
