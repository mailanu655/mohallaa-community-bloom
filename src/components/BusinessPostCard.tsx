import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Building,
  Calendar,
  MapPin,
  Crown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BusinessPostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    post_type: string;
    created_at: string;
    view_count: number;
    engagement_count: number;
    is_promoted: boolean;
    businesses: {
      id: string;
      name: string;
      image_url?: string;
      is_verified?: boolean;
      city: string;
      state: string;
    };
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
  onEngagement?: (postId: string, type: 'like' | 'comment' | 'share') => void;
}

export const BusinessPostCard = ({ post, onEngagement }: BusinessPostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onEngagement?.(post.id, 'like');
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'deal': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'update': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, 300) + '...'
    : post.content;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${post.is_promoted ? 'ring-2 ring-primary/20' : ''}`}>
      {post.is_promoted && (
        <div className="bg-gradient-primary text-white px-4 py-2 text-xs font-medium flex items-center gap-2 rounded-t-lg">
          <Crown className="w-3 h-3" />
          Promoted Post
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center relative">
              {post.businesses.image_url ? (
                <img 
                  src={post.businesses.image_url} 
                  alt={post.businesses.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building className="w-6 h-6 text-primary" />
              )}
              {post.businesses.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {post.businesses.name}
              </h3>
              {post.businesses.is_verified && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={post.profiles.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {post.profiles.first_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{post.profiles.first_name} {post.profiles.last_name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{post.businesses.city}, {post.businesses.state}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <Badge className={getPostTypeColor(post.post_type)}>
            {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <h4 className="font-semibold text-lg leading-tight">{post.title}</h4>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
            
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto font-medium text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.engagement_count + (isLiked ? 1 : 0)}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEngagement?.(post.id, 'comment')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4" />
                Comment
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEngagement?.(post.id, 'share')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{post.view_count} views</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};