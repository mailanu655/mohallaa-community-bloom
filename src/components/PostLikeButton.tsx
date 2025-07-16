import { Heart } from 'lucide-react';
import { useVoting } from '@/hooks/useVoting';
import { useAuth } from '@/contexts/AuthContext';

interface PostLikeButtonProps {
  postId: string;
}

export const PostLikeButton = ({ postId }: PostLikeButtonProps) => {
  const { user } = useAuth();
  const { upvotes, userVote, vote, isLoading } = useVoting(postId, 'post');
  const isLiked = userVote === 'upvote';
  
  const handleLike = () => {
    if (!user) {
      // Redirect to auth page or show login modal
      window.location.href = '/auth';
      return;
    }
    vote('upvote');
  };
  
  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
      <span className="text-sm">{upvotes}</span>
    </button>
  );
};