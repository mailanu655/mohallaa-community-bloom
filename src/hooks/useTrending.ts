import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopic {
  hashtag: string;
  count: number;
  category: string;
}

export const useTrending = () => {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);

      // Get recent posts (last 7 days) to analyze trending topics
      const { data: posts, error } = await supabase
        .from('posts')
        .select('content, tags, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count hashtags from content and tags
      const hashtagCounts: Record<string, number> = {};
      const hashtagCategories: Record<string, string> = {};

      posts?.forEach(post => {
        // Extract hashtags from content
        const contentHashtags = extractHashtags(post.content);
        contentHashtags.forEach(hashtag => {
          const cleanTag = hashtag.toLowerCase();
          hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
          
          // Categorize hashtags
          if (!hashtagCategories[cleanTag]) {
            if (cleanTag.includes('event') || cleanTag.includes('meetup')) {
              hashtagCategories[cleanTag] = 'Events';
            } else if (cleanTag.includes('food') || cleanTag.includes('restaurant') || cleanTag.includes('dining')) {
              hashtagCategories[cleanTag] = 'Food & Dining';
            } else if (cleanTag.includes('community') || cleanTag.includes('indian') || cleanTag.includes('desi')) {
              hashtagCategories[cleanTag] = 'Community';
            } else if (cleanTag.includes('business') || cleanTag.includes('service')) {
              hashtagCategories[cleanTag] = 'Business';
            } else {
              hashtagCategories[cleanTag] = 'General';
            }
          }
        });

        // Also count tags array if present
        post.tags?.forEach(tag => {
          const cleanTag = `#${tag.toLowerCase()}`;
          hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
          
          if (!hashtagCategories[cleanTag]) {
            hashtagCategories[cleanTag] = 'General';
          }
        });
      });

      // Convert to trending topics array and sort by count
      const trendingTopics: TrendingTopic[] = Object.entries(hashtagCounts)
        .map(([hashtag, count]) => ({
          hashtag,
          count,
          category: hashtagCategories[hashtag] || 'General'
        }))
        .filter(topic => topic.count >= 2) // Only show topics with at least 2 mentions
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 trending topics

      // If no real trending topics, show some defaults based on actual community activity
      if (trendingTopics.length === 0) {
        const { data: recentPosts } = await supabase
          .from('posts')
          .select('id')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const { data: recentEvents } = await supabase
          .from('events')
          .select('id')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const { data: recentMarketplace } = await supabase
          .from('marketplace')
          .select('id')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        const defaultTopics: TrendingTopic[] = [
          {
            hashtag: '#CommunityUpdates',
            count: recentPosts?.length || 0,
            category: 'Community'
          },
          {
            hashtag: '#LocalEvents',
            count: recentEvents?.length || 0,
            category: 'Events'
          },
          {
            hashtag: '#Marketplace',
            count: recentMarketplace?.length || 0,
            category: 'Business'
          }
        ].filter(topic => topic.count > 0);

        setTrending(defaultTopics);
      } else {
        setTrending(trendingTopics);
      }

    } catch (error) {
      console.error('Error fetching trending topics:', error);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();

    // Refresh trending topics every 5 minutes
    const interval = setInterval(fetchTrendingTopics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { trending, loading, refetch: fetchTrendingTopics };
};