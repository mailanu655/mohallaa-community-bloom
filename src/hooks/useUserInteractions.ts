import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserInteraction {
  post_id: string;
  interaction_type: 'view' | 'like' | 'comment' | 'share' | 'bookmark' | 'click';
  duration_seconds?: number;
  metadata?: Record<string, any>;
}

export const useUserInteractions = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);

  const trackInteraction = useCallback(async (interaction: UserInteraction) => {
    if (!user) return;

    setIsTracking(true);
    try {
      await supabase
        .from('user_interactions')
        .upsert({
          user_id: user.id,
          post_id: interaction.post_id,
          interaction_type: interaction.interaction_type,
          duration_seconds: interaction.duration_seconds || 0,
          metadata: interaction.metadata || {}
        }, {
          onConflict: 'user_id,post_id,interaction_type'
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    } finally {
      setIsTracking(false);
    }
  }, [user]);

  const trackView = useCallback((postId: string, duration?: number) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'view',
      duration_seconds: duration
    });
  }, [trackInteraction]);

  const trackLike = useCallback((postId: string) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'like'
    });
  }, [trackInteraction]);

  const trackComment = useCallback((postId: string) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'comment'
    });
  }, [trackInteraction]);

  const trackShare = useCallback((postId: string) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'share'
    });
  }, [trackInteraction]);

  const trackBookmark = useCallback((postId: string) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'bookmark'
    });
  }, [trackInteraction]);

  const trackClick = useCallback((postId: string, metadata?: Record<string, any>) => {
    trackInteraction({
      post_id: postId,
      interaction_type: 'click',
      metadata
    });
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackView,
    trackLike,
    trackComment,
    trackShare,
    trackBookmark,
    trackClick,
    isTracking
  };
};