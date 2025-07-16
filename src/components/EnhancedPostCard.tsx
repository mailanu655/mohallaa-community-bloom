import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MapPin,
  Clock,
  Users,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    post_type: string;
    created_at: string;
    upvotes: number;
    comment_count: number;
    author_id: string;
    community_id?: string;
    media_urls?: string[];
    tags?: string[];
    profiles?: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
    communities?: {
      name: string;
      city: string;
      state: string;
    };
  };
  isHighlighted?: boolean;
  showConnection?: boolean;
  onPostClick?: (postId: string) => void;
}

const EnhancedPostCard = ({ post, isHighlighted = false, showConnection = false, onPostClick }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.upvotes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'announcement': return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      case 'discussion': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'resource': return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <Card className={`border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
      isHighlighted ? 'ring-2 ring-primary/20 bg-primary/5' : ''
    }`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link 
                    to={`/profile/${post.author_id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {post.profiles?.first_name} {post.profiles?.last_name}
                  </Link>
                  
                  {showConnection && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Connection
                    </Badge>
                  )}
                  
                  {isHighlighted && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
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
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs px-2 py-1 ${getPostTypeColor(post.post_type)}`}>
                    {post.post_type}
                  </Badge>
                  
                  {post.tags?.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              <button 
                onClick={() => onPostClick?.(post.id)}
                className="hover:text-primary transition-colors text-left"
              >
                {post.title}
              </button>
            </h3>
            
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {post.content}
            </p>
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <div key={index} className="aspect-video bg-muted rounded-lg"></div>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              
              <button 
                onClick={() => onPostClick?.(post.id)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comment_count || 0}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
            
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`transition-colors ${
                isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostCard;