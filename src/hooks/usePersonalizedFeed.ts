import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { requestService } from '@/utils/requestService';
import { ApiErrorHandler } from '@/utils/errorHandler';

interface PersonalizedPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  community_id: string | null;
  post_type: string;
  tags: string[] | null;
  media_urls: string[] | null;
  media_type: string | null;
  upvotes: number | null;
  downvotes: number | null;
  comment_count: number | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id?: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    profession?: string | null;
  };
  communities?: {
    id?: string;
    name: string;
    city?: string;
    state?: string;
    type?: string;
  };
  final_score?: number;
  engagement_score?: number;
  relevance_score?: number;
  recency_score?: number;
}

export const usePersonalizedFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PersonalizedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonalizedFeed = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get personalized post IDs using the new request service
      const personalizedData = await requestService.getPersonalizedFeed(user.id, 20);

      if (!personalizedData || personalizedData.length === 0) {
        // Fallback to regular feed if personalized feed is empty
        const fallbackData = await requestService.getPosts(1, 20, 'latest');
        setPosts((fallbackData || []) as PersonalizedPost[]);
        return;
      }

      // Get full post data for the personalized post IDs
      const postIds = personalizedData.map(item => item.post_id);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          author_id,
          community_id,
          post_type,
          tags,
          media_urls,
          media_type,
          upvotes,
          downvotes,
          comment_count,
          created_at,
          updated_at,
          profiles!posts_author_id_fkey (
            id,
            first_name,
            last_name,
            avatar_url,
            profession
          ),
          communities (
            id,
            name,
            type
          )
        `)
        .in('id', postIds);

      if (postsError) throw postsError;

      // Merge post data with personalization scores and sort by final score
      const personalizedPosts = postsData.map(post => {
        const scoreData = personalizedData.find(item => item.post_id === post.id);
        return {
          ...post,
          final_score: scoreData?.final_score || 0,
          engagement_score: scoreData?.engagement_score || 0,
          relevance_score: scoreData?.relevance_score || 0,
          recency_score: scoreData?.recency_score || 0
        };
      }).sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

      setPosts(personalizedPosts);
    } catch (err) {
      // Use the new error handler
      const apiError = ApiErrorHandler.handle(err, 'Personalized Feed');
      setError(apiError.message);
      
      // If we get a network error, try fallback
      if (ApiErrorHandler.isNetworkError(err)) {
        try {
          const fallbackData = await requestService.getPosts(1, 20, 'latest');
          setPosts((fallbackData || []) as PersonalizedPost[]);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPersonalizedFeed();
  }, [fetchPersonalizedFeed]);

  const refreshFeed = useCallback(() => {
    fetchPersonalizedFeed();
  }, [fetchPersonalizedFeed]);

  return {
    posts,
    loading,
    error,
    refreshFeed
  };
};