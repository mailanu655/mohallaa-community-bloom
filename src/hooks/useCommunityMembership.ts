import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCommunityMembership = (communityId: string) => {
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && communityId) {
      checkMembership();
    }
  }, [user, communityId]);

  const checkMembership = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('community_id', communityId)
        .single();

      setIsMember(!!data);
    } catch (error) {
      // Not a member if no record found
      setIsMember(false);
    }
  };

  const joinCommunity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join communities.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          user_id: user.id,
          community_id: communityId
        });

      if (error) throw error;

      setIsMember(true);
      toast({
        title: "Welcome to the community!",
        description: "You've successfully joined this community.",
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leaveCommunity = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) throw error;

      setIsMember(false);
      toast({
        title: "Left community",
        description: "You've left this community.",
      });
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isMember,
    isLoading,
    joinCommunity,
    leaveCommunity
  };
};