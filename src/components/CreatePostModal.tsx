import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  AtSign, 
  Image as ImageIcon, 
  MapPin,
  Smile,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    visibility: 'public',
    communityId: '',
    mediaUrls: [] as string[]
  });
  
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (open) {
      fetchCommunities();
    }
  }, [open]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      visibility: 'public',
      communityId: '',
      mediaUrls: []
    });
    setCharacterCount(0);
    setShowFileUploader(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleContentChange = (content: string) => {
    if (content.length <= 2000) {
      setFormData(prev => ({ ...prev, content }));
      setCharacterCount(content.length);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector('textarea[data-content]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + text + value.substring(end);
      handleContentChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const handleMention = () => {
    insertAtCursor('@');
  };

  const handleLocation = () => {
    insertAtCursor('📍 ');
  };

  const handleImageUpload = (fileInfo: any) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, fileInfo.publicUrl]
    }));
    setShowFileUploader(false);
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!user || !formData.content.trim()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          title: formData.title || null,
          content: formData.content,
          post_type: 'discussion',
          community_id: formData.communityId || null,
          author_id: user.id,
          media_urls: formData.mediaUrls.length > 0 ? formData.mediaUrls : null,
          media_type: formData.mediaUrls.length > 0 ? 'mixed' : null
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });

      resetForm();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 bg-background border border-border shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
              <SelectTrigger className="w-24 h-8 border-0 bg-transparent text-sm">
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span className="capitalize">{formData.visibility}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!formData.content.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 h-8 text-sm font-medium"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground text-sm">
                {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
              </h3>
            </div>
          </div>

          {/* Title Input (Optional) */}
          <Input
            placeholder="Title (optional)"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="border-0 p-0 text-lg font-medium placeholder:text-muted-foreground focus-visible:ring-0 bg-transparent"
          />

          {/* Content Input */}
          <div className="space-y-2">
            <Textarea
              data-content
              placeholder="What are you working on?"
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[120px] border-0 p-0 text-base placeholder:text-muted-foreground resize-none focus-visible:ring-0 bg-transparent"
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Type @ to mention people and companies</span>
              <span className={characterCount > 1800 ? 'text-destructive' : ''}>{characterCount}/2000</span>
            </div>
          </div>

          {/* Media Preview */}
          {formData.mediaUrls.length > 0 && (
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
          )}

          {/* File Uploader */}
          {showFileUploader && (
            <div className="p-3 border border-border rounded-lg bg-muted/30">
              <FileUploader
                onUploadComplete={handleImageUpload}
                maxFiles={5}
                folder="posts"
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                maxSizeMB={10}
              />
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMention}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Add mention"
              >
                <AtSign className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFileUploader(!showFileUploader)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Add image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLocation}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Add location"
              >
                <MapPin className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {}}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>

            {/* Community Selection */}
            {communities.length > 0 && (
              <Select value={formData.communityId} onValueChange={(value) => setFormData(prev => ({ ...prev, communityId: value }))}>
                <SelectTrigger className="w-auto h-8 border-0 bg-transparent text-xs">
                  <SelectValue placeholder="Community" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General</SelectItem>
                  {communities.map(community => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;