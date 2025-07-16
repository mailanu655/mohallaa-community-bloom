import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  MessageSquare, 
  Megaphone, 
  Calendar, 
  Tag,
  Crown,
  Target,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreateBusinessPostDialogProps {
  businessId: string;
  onPostCreated?: () => void;
}

export const CreateBusinessPostDialog = ({ businessId, onPostCreated }: CreateBusinessPostDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'update',
    is_promoted: false,
    promotion_budget: 0,
    promotion_days: 7
  });

  const postTypes = [
    { value: 'update', label: 'Business Update', icon: MessageSquare, description: 'Share news or updates about your business' },
    { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Important announcements for your community' },
    { value: 'event', label: 'Event', icon: Calendar, description: 'Promote an upcoming event' },
    { value: 'deal', label: 'Special Deal', icon: Tag, description: 'Share special offers or promotions' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const promotionEndDate = formData.is_promoted 
        ? new Date(Date.now() + formData.promotion_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('business_posts')
        .insert({
          business_id: businessId,
          author_id: user.id,
          title: formData.title,
          content: formData.content,
          post_type: formData.post_type,
          is_promoted: formData.is_promoted,
          promotion_budget: formData.is_promoted ? formData.promotion_budget : 0,
          promotion_end_date: promotionEndDate
        });

      if (error) throw error;

      toast.success('Post created successfully!');
      setFormData({
        title: '',
        content: '',
        post_type: 'update',
        is_promoted: false,
        promotion_budget: 0,
        promotion_days: 7
      });
      setOpen(false);
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPostType = postTypes.find(type => type.value === formData.post_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Post
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Business Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div className="space-y-3">
            <Label>Post Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all duration-200 ${
                      formData.post_type === type.value 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, post_type: type.value }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{type.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`Enter your ${selectedPostType?.label.toLowerCase()} title...`}
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share details about your announcement, update, or promotion..."
              rows={6}
              required
            />
          </div>

          {/* Promotion Options */}
          <Card className="border border-dashed border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Promote this post</h4>
                    <p className="text-sm text-muted-foreground">
                      Reach more neighbors and increase engagement
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_promoted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promoted: checked }))}
                />
              </div>

              {formData.is_promoted && (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Daily Budget
                      </Label>
                      <Input
                        id="budget"
                        type="number"
                        min="5"
                        step="5"
                        value={formData.promotion_budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, promotion_budget: Number(e.target.value) }))}
                        placeholder="25"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="days" className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Duration (days)
                      </Label>
                      <Select
                        value={formData.promotion_days.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, promotion_days: Number(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.promotion_budget > 0 && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">
                        <span className="font-medium">Total cost:</span> ${formData.promotion_budget * formData.promotion_days}
                        <span className="text-muted-foreground ml-2">
                          (${formData.promotion_budget}/day × {formData.promotion_days} days)
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
              disabled={loading || !formData.title || !formData.content}
              className="flex-1"
            >
              {loading ? 'Creating...' : formData.is_promoted ? 'Create & Promote' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};