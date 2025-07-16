import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose } from '@/components/ui/dialog';
import FileUploader from '@/components/FileUploader';

interface CreatePostFormProps {
  communities: Array<{ id: string; name: string }>;
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ communities, onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'discussion',
    communityId: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          post_type: formData.postType as 'discussion' | 'question' | 'announcement' | 'resource',
          community_id: formData.communityId || null,
          author_id: user.id,
          tags: tagsArray.length > 0 ? tagsArray : null,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        postType: 'discussion',
        communityId: '',
        tags: ''
      });
      setMediaUrls([]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Community (optional)</label>
        <Select value={formData.communityId} onValueChange={(value) => setFormData({ ...formData, communityId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select community" />
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

      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          placeholder="Enter post title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <Textarea
          placeholder="What would you like to share with the community?"
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags (optional)</label>
        <Input
          placeholder="Add tags separated by commas..."
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Media (optional)</label>
        <FileUploader
          onUploadComplete={(fileInfo) => {
            setMediaUrls(prev => [...prev, fileInfo.url]);
          }}
          maxFiles={4}
          folder="posts"
          acceptedFileTypes={['image/*', 'video/*']}
          maxSizeMB={10}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <DialogClose asChild>
          <Button variant="outline" type="button">Cancel</Button>
        </DialogClose>
        <Button type="submit" variant="cultural" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;