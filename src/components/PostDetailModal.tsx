import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  X,
  MapPin,
  Clock,
  Reply
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import SharePostModal from './SharePostModal';

interface PostDetailModalProps {
  postId: string | null;
  open: boolean;
  onClose: () => void;
}

const PostDetailModal = ({ postId, open, onClose }: PostDetailModalProps) => {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (postId && open) {
      fetchPostData();
    }
  }, [postId, open]);

  const fetchPostData = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .eq('id', postId)
        .single();

      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setPost(postData);
      setComments(commentsData || []);
      setLikeCount(postData?.upvotes || 0);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0 bg-background rounded-2xl">
        <DialogClose className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center transition-colors">
          <X className="h-4 w-4" />
        </DialogClose>

        {loading ? (
          <div className="p-6 space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : post ? (
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Post Content */}
            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {post.profiles?.first_name} {post.profiles?.last_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{post.communities?.name || 'General'}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              {/* Post Text */}
              <p className="text-foreground leading-relaxed">
                {post.content}
              </p>
              
              {/* Reaction Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={handleLike}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm">{likeCount > 0 ? `${likeCount} reaction${likeCount > 1 ? 's' : ''}` : 'Like'}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShareModalOpen(true)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t bg-muted/20 flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <h5 className="font-semibold text-foreground">
                  Comments ({comments.length})
                </h5>
                
                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comment.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {comment.profiles?.first_name?.[0]}{comment.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {comment.profiles?.first_name} {comment.profiles?.last_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-foreground leading-relaxed mb-3">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              Like
                            </button>
                            <button className="hover:text-primary transition-colors flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              Reply
                            </button>
                            <button className="hover:text-primary transition-colors flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                            <button className="hover:text-primary transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {comments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
                
                {/* Add Comment */}
                <div className="border-t pt-4 mt-6">
                  <div className="flex space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[50px] resize-none border border-border rounded-xl bg-background"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        )}
      </DialogContent>
      
      {/* Share Modal */}
      <SharePostModal 
        post={post}
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </Dialog>
  );
};

export default PostDetailModal;