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
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-700';
      case 'announcement': return 'bg-orange-100 text-orange-700';
      case 'discussion': return 'bg-green-100 text-green-700';
      case 'resource': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogClose className="absolute right-4 top-4 z-10 w-6 h-6 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <X className="h-5 w-5" />
        </DialogClose>

        {loading ? (
          <div className="p-8 space-y-4">
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
          <div className="flex flex-col h-full">
            {/* Post Header */}
            <div className="p-6 border-b">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {post.profiles?.first_name} {post.profiles?.last_name}
                    </h3>
                    <Badge className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                      {post.post_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                    
                    {post.communities && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.communities.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="mt-4 space-y-3">
                <h4 className="text-lg font-medium text-foreground">{post.title}</h4>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
              
              {/* Post Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-colors ${
                      isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">Like</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h5 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </h5>
                
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {comment.profiles?.first_name?.[0]}{comment.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.profiles?.first_name} {comment.profiles?.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-foreground leading-relaxed mb-2">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <button className="hover:text-red-500 transition-colors flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              Like
                            </button>
                            <button className="hover:text-primary transition-colors flex items-center gap-1">
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>
                            <button className="hover:text-primary transition-colors flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              Share
                            </button>
                            <Button variant="ghost" size="sm" className="h-auto p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
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
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[40px] resize-none border-0 bg-muted/50 focus:bg-background"
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
    </Dialog>
  );
};

export default PostDetailModal;