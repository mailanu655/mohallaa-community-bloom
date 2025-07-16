import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import RichTextEditor from './RichTextEditor';
import FileUploader from './FileUploader';
import { X, Image, Type, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface EnhancedCreatePostFormProps {
  communities: Array<{ id: string; name: string }>;
  onPostCreated: () => void;
  initialContent?: string;
}

const EnhancedCreatePostForm: React.FC<EnhancedCreatePostFormProps> = ({ 
  communities, 
  onPostCreated,
  initialContent = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: initialContent,
    richContent: initialContent,
    postType: 'discussion',
    communityId: '',
    categoryId: '',
    tags: [] as string[],
    mediaUrls: [] as string[]
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update form data when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setFormData(prev => ({
        ...prev,
        content: initialContent,
        richContent: initialContent
      }));
    }
  }, [initialContent]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('post_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleMediaUpload = (fileInfo: any) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, fileInfo.publicUrl]
    }));
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
      
      const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content || formData.richContent.replace(/<[^>]*>/g, ''), // Fallback to plain text
          rich_content: formData.richContent ? { html: formData.richContent } : null,
          post_type: formData.postType as any,
          community_id: formData.communityId || null,
          author_id: user.id,
          tags: formData.tags.length > 0 ? formData.tags : null,
          media_urls: formData.mediaUrls.length > 0 ? formData.mediaUrls : null,
          media_type: formData.mediaUrls.length > 0 ? 'mixed' : null
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: `Your ${selectedCategory?.name.toLowerCase() || formData.postType} post has been shared.`,
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        richContent: '',
        postType: 'discussion',
        communityId: '',
        categoryId: '',
        tags: [],
        mediaUrls: []
      });
      setNewTag('');

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Create New Post</h2>
        {selectedCategory && (
          <Badge 
            style={{ 
              backgroundColor: selectedCategory.color + '20',
              color: selectedCategory.color,
              border: `1px solid ${selectedCategory.color}40`
            }}
          >
            {selectedCategory.name}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags & Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {categories.map(category => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.categoryId === category.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, categoryId: category.id })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="What's your post about?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Rich Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <RichTextEditor
              value={formData.richContent}
              onChange={(content) => setFormData({ ...formData, richContent: content })}
              placeholder="Share your thoughts with the community..."
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Add Images or Files</label>
              <FileUploader
                onUploadComplete={handleMediaUpload}
                maxFiles={5}
                folder="posts"
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']}
                maxSizeMB={20}
              />
            </div>

            {/* Media Preview */}
            {formData.mediaUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Attached Media</label>
                <div className="grid grid-cols-2 gap-2">
                  {formData.mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          {/* Post Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Type</label>
            <Select value={formData.postType} onValueChange={(value) => setFormData({ ...formData, postType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="resource">Resource</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="job">Job Posting</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="recommendation">Recommendation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Community */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Community</label>
            <Select value={formData.communityId} onValueChange={(value) => setFormData({ ...formData, communityId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select community (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Discussion</SelectItem>
                {communities.map(community => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <DialogClose asChild>
          <Button variant="outline" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" variant="cultural" disabled={isLoading || !formData.title.trim()}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedCreatePostForm;