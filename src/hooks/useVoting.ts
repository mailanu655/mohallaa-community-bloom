import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoteData {
  upvotes: number;
  downvotes: number;
  userVote: 'upvote' | 'downvote' | null;
}

export const useVoting = (itemId: string, itemType: 'post' | 'comment') => {
  const [voteData, setVoteData] = useState<VoteData>({
    upvotes: 0,
    downvotes: 0,
    userVote: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVotes();
  }, [itemId, user]);

  const fetchVotes = async () => {
    console.log('Fetching votes for:', { itemId, itemType, user: user?.id });
    try {
      if (itemType === 'post') {
        // Get post vote counts
        const { data: votes } = await supabase
          .from('post_votes')
          .select('vote_type')
          .eq('post_id', itemId);

        const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0;
        const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0;

        // Get user's vote if authenticated
        let userVote = null;
        if (user) {
          const { data: userVoteData } = await supabase
            .from('post_votes')
            .select('vote_type')
            .eq('post_id', itemId)
            .eq('user_id', user.id)
            .single();

          userVote = userVoteData?.vote_type || null;
        }

        setVoteData({ upvotes, downvotes, userVote });
      } else {
        // Get comment vote counts
        const { data: votes } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', itemId);

        const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0;
        const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0;

        // Get user's vote if authenticated
        let userVote = null;
        if (user) {
          const { data: userVoteData } = await supabase
            .from('comment_votes')
            .select('vote_type')
            .eq('comment_id', itemId)
            .eq('user_id', user.id)
            .single();

          userVote = userVoteData?.vote_type || null;
        }

        setVoteData({ upvotes, downvotes, userVote });
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const vote = async (voteType: 'upvote' | 'downvote') => {
    console.log('Vote function called:', { voteType, user: user?.id, itemId });
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on posts.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (voteData.userVote === voteType) {
        // Remove vote if clicking the same vote type
        if (itemType === 'post') {
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', itemId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', itemId)
            .eq('user_id', user.id);
        }
      } else {
        // Upsert vote (insert or update)
        if (itemType === 'post') {
          await supabase
            .from('post_votes')
            .upsert({
              user_id: user.id,
              post_id: itemId,
              vote_type: voteType
            });
        } else {
          await supabase
            .from('comment_votes')
            .upsert({
              user_id: user.id,
              comment_id: itemId,
              vote_type: voteType
            });
        }
      }

      // Refresh vote counts
      await fetchVotes();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...voteData,
    vote,
    isLoading
  };
};