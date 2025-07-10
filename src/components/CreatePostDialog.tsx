import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  Camera, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  AlertTriangle,
  Heart,
  Users,
  Briefcase,
  Home,
  X,
  Upload,
  Image
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  onPostCreated?: () => void;
}

const postTypes = [
  { 
    value: "discussion", 
    label: "General Discussion", 
    icon: MessageSquare,
    color: "bg-blue-500",
    description: "Share thoughts, questions, or start a conversation"
  },
  { 
    value: "announcement", 
    label: "Announcement", 
    icon: AlertTriangle,
    color: "bg-orange-500",
    description: "Important community updates or notices"
  },
  { 
    value: "marketplace", 
    label: "For Sale & Free", 
    icon: ShoppingBag,
    color: "bg-green-500",
    description: "Buy, sell, or give away items"
  },
  { 
    value: "event", 
    label: "Event", 
    icon: Calendar,
    color: "bg-purple-500",
    description: "Community events and gatherings"
  },
  { 
    value: "job", 
    label: "Jobs", 
    icon: Briefcase,
    color: "bg-indigo-500",
    description: "Job opportunities and hiring"
  },
  { 
    value: "housing", 
    label: "Housing", 
    icon: Home,
    color: "bg-red-500",
    description: "Rentals, roommates, and housing"
  },
  { 
    value: "recommendation", 
    label: "Recommendation", 
    icon: Heart,
    color: "bg-pink-500",
    description: "Recommend local businesses or services"
  }
] as const;

const CreatePostDialog = ({ isOpen, onClose, communityId, onPostCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'content'>('type');
  const [selectedType, setSelectedType] = useState<Database['public']['Enums']['post_type'] | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPostType = postTypes.find(type => type.value === selectedType);

  const handleTypeSelect = (type: Database['public']['Enums']['post_type']) => {
    setSelectedType(type);
    setStep('content');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + mediaFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const uploadMedia = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload media files if any
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia(mediaFiles);
      }

      // Create the post
      const { error } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          content: content.trim(),
          post_type: selectedType as Database['public']['Enums']['post_type'],
          community_id: communityId,
          author_id: user.id,
          tags: tags.length > 0 ? tags : null,
          media_urls: mediaUrls.length > 0 ? mediaUrls : null,
          media_type: mediaUrls.length > 0 ? 'image' : null
        });

      if (error) throw error;

      toast.success("Post created successfully!");
      
      // Reset form
      setStep('type');
      setSelectedType('');
      setTitle('');
      setContent('');
      setTags([]);
      setMediaFiles([]);
      
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType('');
    setTitle('');
    setContent('');
    setTags([]);
    setMediaFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'What would you like to share?' : `Create ${selectedPostType?.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {postTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card 
                  key={type.value}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  onClick={() => handleTypeSelect(type.value as Database['public']['Enums']['post_type'])}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{type.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {step === 'content' && (
          <div className="space-y-6 py-4">
            {/* Back button and type indicator */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep('type')}>
                ← Back to categories
              </Button>
              {selectedPostType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <selectedPostType.icon className="w-3 h-3" />
                  {selectedPostType.label}
                </Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your post about?"
                className="mt-2"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Description *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share more details..."
                rows={6}
                className="mt-2"
              />
            </div>

            {/* Media Upload */}
            <div>
              <Label>Photos (optional)</Label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    Add Photos
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {mediaFiles.length}/5 photos
                  </span>
                </div>
                
                <input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMediaFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (optional)</Label>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !title.trim() || !content.trim()}
                variant="cultural"
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;