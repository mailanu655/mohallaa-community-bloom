import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pin, PinOff, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostModerationActionsProps {
  postId: string;
  isPinned: boolean;
  canModerate: boolean;
  isAuthor: boolean;
  onUpdate: (postId: string, updates: { is_pinned?: boolean }) => void;
  onDelete?: (postId: string) => void;
}

const PostModerationActions: React.FC<PostModerationActionsProps> = ({
  postId,
  isPinned,
  canModerate,
  isAuthor,
  onUpdate,
  onDelete
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePinToggle = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: !isPinned })
        .eq('id', postId);

      if (error) throw error;

      onUpdate(postId, { is_pinned: !isPinned });
      toast({
        title: isPinned ? "Post Unpinned" : "Post Pinned",
        description: isPinned ? "Post has been unpinned." : "Post has been pinned to the top."
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      if (onDelete) {
        onDelete(postId);
      }
      toast({
        title: "Post Deleted",
        description: "The post has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show moderation actions if user has no permissions
  if (!canModerate && !isAuthor) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          disabled={isUpdating}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        {canModerate && (
          <DropdownMenuItem onClick={handlePinToggle}>
            {isPinned ? (
              <>
                <PinOff className="w-4 h-4 mr-2" />
                Unpin Post
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 mr-2" />
                Pin Post
              </>
            )}
          </DropdownMenuItem>
        )}
        
        {(isAuthor || canModerate) && (
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </DropdownMenuItem>
        )}
        
        {canModerate && !isAuthor && (
          <DropdownMenuItem className="text-orange-600 focus:text-orange-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Post
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostModerationActions;