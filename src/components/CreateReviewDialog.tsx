import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Star, 
  Heart,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateReviewDialogProps {
  businessId: string;
  businessName: string;
  onReviewCreated?: () => void;
}

export const CreateReviewDialog = ({ businessId, businessName, onReviewCreated }: CreateReviewDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    is_recommended: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || formData.rating === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_reviews')
        .insert({
          business_id: businessId,
          reviewer_id: user.id,
          rating: formData.rating,
          title: formData.title || null,
          content: formData.content || null,
          is_recommended: formData.is_recommended
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setFormData({
        rating: 0,
        title: '',
        content: '',
        is_recommended: true
      });
      setOpen(false);
      onReviewCreated?.();
    } catch (error: any) {
      console.error('Error creating review:', error);
      if (error.code === '23505') {
        toast.error('You have already reviewed this business.');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
        className="group transition-transform hover:scale-110"
      >
        <Star
          className={`w-8 h-8 transition-colors ${
            i < formData.rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 group-hover:text-yellow-200'
          }`}
        />
      </button>
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Below Average';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Rate this business';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Write Review
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review {businessName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-3 text-center">
            <Label className="text-base font-medium">How would you rate this business?</Label>
            <div className="flex justify-center gap-1">
              {renderStars()}
            </div>
            <p className="text-sm text-muted-foreground">
              {getRatingText(formData.rating)}
            </p>
          </div>

          {/* Recommendation */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className={`w-5 h-5 ${formData.is_recommended ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              <div>
                <Label className="font-medium">Would you recommend this business?</Label>
                <p className="text-sm text-muted-foreground">
                  Help your neighbors discover great local businesses
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_recommended}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recommended: checked }))}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Review Details (Optional)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share more details about your experience. What did you like? What could be improved?"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};