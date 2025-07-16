import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/contexts/AuthContext';

interface PostBookmarkButtonProps {
  postId: string;
}

export const PostBookmarkButton = ({ postId }: PostBookmarkButtonProps) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark, isLoading } = useBookmarks(postId);
  
  const handleBookmark = () => {
    if (!user) {
      // Redirect to auth page or show login modal
      window.location.href = '/auth';
      return;
    }
    toggleBookmark();
  };
  
  return (
    <button 
      onClick={handleBookmark}
      disabled={isLoading}
      className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-muted/50 rounded-full disabled:opacity-50"
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
      <span className="text-sm">{isBookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
};