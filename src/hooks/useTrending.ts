import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopic {
  category: string;
  count: number;
  label: string;
}

export const useTrending = () => {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);

      // Get recent posts from the last 7 days
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('post_type, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Count posts by category (post_type)
      const categoryCounts: Record<string, number> = {};
      
      recentPosts?.forEach(post => {
        const category = post.post_type || 'discussion';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      // Convert to trending topics array and sort by count
      const trendingTopics: TrendingTopic[] = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          category,
          count,
          label: getCategoryLabel(category)
        }))
        .filter(topic => topic.count >= 1) // Show categories with at least 1 post
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 trending categories

      setTrending(trendingTopics);

    } catch (error) {
      console.error('Error fetching trending topics:', error);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'discussion': 'Discussions',
      'question': 'Questions',
      'announcement': 'Announcements',
      'resource': 'Resources',
      'event': 'Events',
      'job': 'Jobs',
      'housing': 'Housing',
      'marketplace': 'Marketplace',
      'recommendation': 'Recommendations',
      'safety_alert': 'Safety Alerts'
    };
    return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  useEffect(() => {
    fetchTrendingTopics();

    // Refresh trending topics every 5 minutes
    const interval = setInterval(fetchTrendingTopics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { trending, loading, refetch: fetchTrendingTopics };
};