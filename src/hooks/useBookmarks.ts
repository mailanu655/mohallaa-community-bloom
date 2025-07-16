import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBookmarks = (postId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !postId) return;

    const checkBookmarkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('post_bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        if (error) {
          console.error('Error checking bookmark status:', error);
          return;
        }

        setIsBookmarked(!!data);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [user, postId]);

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark posts.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
        
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Post removed from your bookmarks.",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('post_bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) throw error;
        
        setIsBookmarked(true);
        toast({
          title: "Post bookmarked",
          description: "Post added to your bookmarks.",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading,
  };
};