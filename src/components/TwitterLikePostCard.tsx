import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Users
} from 'lucide-react';
import SharePostModal from '@/components/SharePostModal';
import PostMediaGallery from '@/components/PostMediaGallery';
import RichContentRenderer from '@/components/RichContentRenderer';

interface TwitterLikePostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    upvotes: number;
    comment_count: number;
    author_id: string;
    media_urls?: string[];
    media_type?: string;
    post_type: string;
    tags?: string[];
    city?: string;
    state?: string;
    location_name?: string;
    profiles?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
    communities?: {
      name: string;
      type: string;
    };
  };
  onPostClick?: (postId: string) => void;
  onCommentClick?: (postId: string) => void;
  onShareClick?: (postId: string) => void;
}

const TwitterLikePostCard = ({ 
  post, 
  onPostClick, 
  onCommentClick, 
  onShareClick 
}: TwitterLikePostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.upvotes || 0);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareModalOpen(true);
    onShareClick?.(post.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCommentClick?.(post.id);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'recommendation': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'event': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'alert': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <>
      <article
        className="border-b border-border/30 p-5 hover:bg-muted/40 transition-all duration-300 cursor-pointer hover:shadow-premium hover-lift glass-effect animate-slide-up"
        onClick={() => onPostClick?.(post.id)}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0 hover:scale-105 transition-all duration-300 hover:shadow-elegant">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
              {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-display font-semibold text-foreground hover:underline cursor-pointer hover:text-primary transition-colors">
                {post.profiles?.first_name} {post.profiles?.last_name}
              </span>
              <span className="text-muted-foreground/70">·</span>
              <span className="text-muted-foreground text-sm font-medium">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              {post.communities && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">
                      {post.communities.name}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Location */}
            {(post.location_name || post.city) && (
              <div className="flex items-center space-x-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {post.location_name || `${post.city}, ${post.state}`}
                </span>
              </div>
            )}

            {/* Post Type Badge */}
            {post.post_type && post.post_type !== 'general' && (
              <Badge 
                variant="outline" 
                className={`mb-2 text-xs ${getPostTypeColor(post.post_type)}`}
              >
                {post.post_type}
              </Badge>
            )}

            {/* Title */}
            {post.title && (
              <h3 className="font-display font-semibold text-foreground mb-2 leading-tight text-lg hover:text-primary transition-colors group-hover:transform group-hover:translate-x-1">
                {post.title}
              </h3>
            )}

            {/* Content */}
            <div className="text-foreground/90 mb-3 leading-relaxed font-body">
              <RichContentRenderer content={post.content} />
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mb-3">
                <PostMediaGallery 
                  mediaUrls={post.media_urls}
                />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-primary hover:underline cursor-pointer text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between max-w-md mt-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary hover:bg-primary/5 group transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 group-hover:fill-primary/20" />
                <span className="text-sm font-medium font-display">{post.comment_count || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-2 group transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isLiked 
                    ? 'text-red-600 animate-bounce-subtle' 
                    : 'text-muted-foreground hover:text-red-600 hover:bg-red-50/50'
                }`}
              >
                <Heart className={`w-4 h-4 transition-all duration-200 ${isLiked ? 'fill-current scale-110' : 'group-hover:fill-red-600/20'}`} />
                <span className="text-sm font-medium font-display">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 text-muted-foreground hover:text-secondary hover:bg-secondary/5 group transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Share className="w-4 h-4 group-hover:fill-secondary/20" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={`flex items-center space-x-2 group transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isSaved 
                    ? 'text-primary animate-pulse-glow' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Bookmark className={`w-4 h-4 transition-all duration-200 ${isSaved ? 'fill-current scale-110' : 'group-hover:fill-primary/20'}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      <SharePostModal
        post={post}
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </>
  );
};

export default TwitterLikePostCard;