import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  Shield,
  Clock,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import MarketplaceFormFields from "@/components/marketplace/MarketplaceFormFields";

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

  // Event-specific fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [eventType, setEventType] = useState('');

  // Marketplace-specific fields
  const [marketplaceData, setMarketplaceData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    isNegotiable: true,
    contactPhone: '',
    contactEmail: '',
    preferredContact: ''
  });
  const [marketplaceImages, setMarketplaceImages] = useState<File[]>([]);

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

  const handleMarketplaceDataChange = (field: string, value: any) => {
    setMarketplaceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarketplaceImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    if (newFiles.length + marketplaceImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setMarketplaceImages(prev => [...prev, ...newFiles]);
  };

  const removeMarketplaceImage = (index: number) => {
    setMarketplaceImages(prev => prev.filter((_, i) => i !== index));
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
    if (!selectedType || !user) {
      toast.error("Please fill in all required fields");
      return;
    }

    // For marketplace posts, use marketplace data for title and content
    const postTitle = selectedType === 'marketplace' ? marketplaceData.title : title;
    const postContent = selectedType === 'marketplace' ? marketplaceData.description : content;

    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Additional validation for event and marketplace posts
    if (selectedType === 'event' && (!startDate || !eventType)) {
      toast.error("Please fill in event date and type");
      return;
    }

    if (selectedType === 'marketplace' && !marketplaceData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload media files if any
      let mediaUrls: string[] = [];
      if (selectedType === 'marketplace' && marketplaceImages.length > 0) {
        mediaUrls = await uploadMedia(marketplaceImages);
      } else if (mediaFiles.length > 0) {
        mediaUrls = await uploadMedia(mediaFiles);
      }

      // Create the post with proper validation
      const postData = {
        title: postTitle.trim(),
        content: postContent.trim(),
        post_type: selectedType,
        community_id: communityId && communityId !== "general" ? communityId : null,
        author_id: user.id,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        media_type: mediaUrls.length > 0 ? 'image' : null
      };

      console.log('Creating post with data:', postData);

      const { data: postResult, error: postError } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (postError) {
        console.error('Supabase error:', postError);
        throw postError;
      }

      // Create corresponding event or marketplace entry if needed
      if (selectedType === 'event' && postResult) {
        const eventData = {
          title: postTitle.trim(),
          description: postContent.trim(),
          start_date: startDate,
          end_date: endDate || null,
          location: location || null,
          max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
          ticket_price: isFree ? null : (ticketPrice ? parseFloat(ticketPrice) : null),
          is_free: isFree,
          is_virtual: isVirtual,
          event_type: eventType as Database['public']['Enums']['event_type'],
          organizer_id: user.id,
          community_id: communityId && communityId !== "general" ? communityId : null,
          source: 'post' as const,
          post_id: postResult.id,
          image_url: mediaUrls.length > 0 ? mediaUrls[0] : null
        };

        const { error: eventError } = await supabase
          .from('events')
          .insert(eventData);

        if (eventError) {
          console.error('Event creation error:', eventError);
          throw eventError;
        }
      }

      if (selectedType === 'marketplace' && postResult) {
        // Prepare contact info
        const contactInfo: any = {};
        if (marketplaceData.contactPhone) contactInfo.phone = marketplaceData.contactPhone;
        if (marketplaceData.contactEmail) contactInfo.email = marketplaceData.contactEmail;
        if (marketplaceData.preferredContact) contactInfo.preferred = marketplaceData.preferredContact;

        const marketplaceEntry = {
          title: postTitle.trim(),
          description: postContent.trim(),
          price: marketplaceData.price ? parseFloat(marketplaceData.price) : null,
          category: marketplaceData.category as Database['public']['Enums']['marketplace_category'],
          is_negotiable: marketplaceData.isNegotiable,
          location: marketplaceData.location || null,
          images: mediaUrls.length > 0 ? mediaUrls : null,
          seller_id: user.id,
          community_id: communityId && communityId !== "general" ? communityId : null,
          source: 'post' as const,
          post_id: postResult.id,
          contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null
        };

        const { error: marketError } = await supabase
          .from('marketplace')
          .insert(marketplaceEntry);

        if (marketError) {
          console.error('Marketplace creation error:', marketError);
          throw marketError;
        }
      }

      toast.success("Post created successfully!");
      
      // Reset form
      resetForm();
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

  const resetForm = () => {
    setStep('type');
    setSelectedType('');
    setTitle('');
    setContent('');
    setMediaFiles([]);
    // Reset event fields
    setStartDate('');
    setEndDate('');
    setLocation('');
    setMaxAttendees('');
    setTicketPrice('');
    setIsVirtual(false);
    setIsFree(true);
    setEventType('');
    // Reset marketplace fields
    setMarketplaceData({
      title: '',
      description: '',
      category: '',
      price: '',
      location: '',
      isNegotiable: true,
      contactPhone: '',
      contactEmail: '',
      preferredContact: ''
    });
    setMarketplaceImages([]);
  };

  const handleClose = () => {
    resetForm();
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

            {/* Marketplace-specific fields */}
            {selectedType === 'marketplace' ? (
              <MarketplaceFormFields
                formData={marketplaceData}
                onFormDataChange={handleMarketplaceDataChange}
                images={marketplaceImages}
                onImageUpload={handleMarketplaceImageUpload}
                onRemoveImage={removeMarketplaceImage}
                maxImages={5}
                showTitle={true}
                showDescription={true}
              />
            ) : (
              <>
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
              </>
            )}

            {/* Event-specific fields */}
            {selectedType === 'event' && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <Label className="text-sm font-medium">Event Details</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date & Time *</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date & Time</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Event Type *</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="religious">Religious</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max-attendees">Max Attendees</Label>
                    <Input
                      id="max-attendees"
                      type="number"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      placeholder="Optional"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Event location or online"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-virtual"
                      checked={isVirtual}
                      onCheckedChange={setIsVirtual}
                    />
                    <Label htmlFor="is-virtual">Virtual Event</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-free"
                      checked={isFree}
                      onCheckedChange={setIsFree}
                    />
                    <Label htmlFor="is-free">Free Event</Label>
                  </div>
                </div>

                {!isFree && (
                  <div>
                    <Label htmlFor="ticket-price">Ticket Price ($)</Label>
                    <Input
                      id="ticket-price"
                      type="number"
                      step="0.01"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      placeholder="0.00"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Media Upload for non-marketplace posts */}
            {selectedType !== 'marketplace' && (
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
            )}

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || 
                  (selectedType === 'marketplace' ? (!marketplaceData.title.trim() || !marketplaceData.description.trim()) : (!title.trim() || !content.trim()))}
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
