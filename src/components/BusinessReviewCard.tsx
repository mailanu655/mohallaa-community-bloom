import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  ThumbsUp, 
  Flag,
  Heart,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BusinessReviewCardProps {
  review: {
    id: string;
    rating: number;
    title?: string;
    content?: string;
    is_recommended: boolean;
    helpful_count: number;
    created_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export const BusinessReviewCard = ({ review, onHelpful, onReport }: BusinessReviewCardProps) => {
  const [isHelpful, setIsHelpful] = useState(false);

  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
    onHelpful?.(review.id);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.profiles.avatar_url} />
            <AvatarFallback className="text-sm font-medium">
              {getInitials(review.profiles.first_name, review.profiles.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-foreground">
                {review.profiles.first_name} {review.profiles.last_name}
              </span>
              
              {review.is_recommended && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Heart className="w-3 h-3 text-red-500 fill-current" />
                  Recommends
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport?.(review.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {review.title && (
            <h4 className="font-semibold text-foreground leading-tight">
              {review.title}
            </h4>
          )}
          
          {review.content && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {review.content}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpful}
              className={`gap-2 ${
                isHelpful 
                  ? 'text-primary hover:text-primary/80' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
              <span>Helpful ({review.helpful_count + (isHelpful ? 1 : 0)})</span>
            </Button>
            
            <div className="text-xs text-muted-foreground">
              {review.rating === 5 && "Excellent"}
              {review.rating === 4 && "Good"}
              {review.rating === 3 && "Average"}
              {review.rating === 2 && "Below Average"}
              {review.rating === 1 && "Poor"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};