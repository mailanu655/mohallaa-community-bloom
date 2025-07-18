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
  Image,
  HelpCircle,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: string;
  onPostCreated?: () => void;
}

const postTypes = [
  { 
    value: "discussion" as const, 
    label: "General Discussion", 
    icon: MessageSquare,
    color: "bg-blue-500",
    description: "Share thoughts, questions, or start a conversation"
  },
  { 
    value: "question" as const, 
    label: "Question", 
    icon: HelpCircle,
    color: "bg-purple-600",
    description: "Ask the community for help or advice"
  },
  { 
    value: "announcement" as const, 
    label: "Announcement", 
    icon: AlertTriangle,
    color: "bg-orange-500",
    description: "Important community updates or notices"
  },
  { 
    value: "resource" as const, 
    label: "Resource", 
    icon: Users,
    color: "bg-teal-500",
    description: "Share helpful resources and information"
  },
  { 
    value: "event" as const, 
    label: "Event", 
    icon: Calendar,
    color: "bg-purple-500",
    description: "Community events and gatherings"
  },
  { 
    value: "job" as const, 
    label: "Jobs", 
    icon: Briefcase,
    color: "bg-indigo-500",
    description: "Job opportunities and hiring"
  },
  { 
    value: "housing" as const, 
    label: "Housing", 
    icon: Home,
    color: "bg-red-500",
    description: "Rentals, roommates, and housing"
  },
  { 
    value: "marketplace" as const, 
    label: "For Sale & Free", 
    icon: ShoppingBag,
    color: "bg-green-500",
    description: "Buy, sell, or give away items"
  },
  { 
    value: "recommendation" as const, 
    label: "Recommendation", 
    icon: Heart,
    color: "bg-pink-500",
    description: "Recommend local businesses or services"
  },
  { 
    value: "safety_alert" as const, 
    label: "Safety Alert", 
    icon: Shield,
    color: "bg-red-600",
    description: "Important safety information for the community"
  }
];

const CreatePostDialog = ({ isOpen, onClose, communityId = "general", onPostCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'content'>('type');
  const [selectedType, setSelectedType] = useState<Database['public']['Enums']['post_type'] | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPostType = postTypes.find(type => type.value === selectedType);

  const handleTypeSelect = (type: Database['public']['Enums']['post_type']) => {
    setSelectedType(type);
    setStep('content');
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
    if (!title.trim() || !content.trim() || !selectedType || !user) {
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

      // Create the post with proper validation
      const postData = {
        title: title.trim(),
        content: content.trim(),
        post_type: selectedType,
        community_id: communityId && communityId !== "general" ? communityId : null,
        author_id: user.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_type: mediaUrls.length > 0 ? 'image' : null
      };

      console.log('Creating post with data:', postData);

      const { error } = await supabase
        .from('posts')
        .insert(postData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success("Post created successfully!");
      
      // Reset form
      setStep('type');
      setSelectedType('');
      setTitle('');
      setContent('');
      setMediaFiles([]);
      
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      toast.error(`Failed to create post: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType('');
    setTitle('');
    setContent('');
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
