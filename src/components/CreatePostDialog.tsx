import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageSquare, 
  Camera, 
  Calendar, 
  ShoppingBag, 
  AlertTriangle,
  Heart,
  Users,
  Briefcase,
  Home,
  X,
  HelpCircle,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import MarketplaceFormFields from "@/components/marketplace/MarketplaceFormFields";
import EventFormFields from "@/components/events/EventFormFields";
import TravelCompanionFormFields from "@/components/post-creation/TravelCompanionFormFields";
import JobFormFields from "@/components/post-creation/JobFormFields";
import HousingFormFields from "@/components/post-creation/HousingFormFields";
import SafetyAlertFormFields from "@/components/post-creation/SafetyAlertFormFields";

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
    color: "text-blue-500",
    description: "Share thoughts, questions, or start a conversation"
  },
  { 
    value: "question" as const, 
    label: "Question", 
    icon: HelpCircle,
    color: "text-purple-600",
    description: "Ask the community for help or advice"
  },
  { 
    value: "announcement" as const, 
    label: "Announcement", 
    icon: AlertTriangle,
    color: "text-orange-500",
    description: "Important community updates or notices"
  },
  { 
    value: "resource" as const, 
    label: "Resource", 
    icon: Users,
    color: "text-teal-500",
    description: "Share helpful resources and information"
  },
  { 
    value: "event" as const, 
    label: "Event", 
    icon: Calendar,
    color: "text-purple-500",
    description: "Community events and gatherings"
  },
  { 
    value: "job" as const, 
    label: "Jobs", 
    icon: Briefcase,
    color: "text-indigo-500",
    description: "Job opportunities and hiring"
  },
  { 
    value: "housing" as const, 
    label: "Housing", 
    icon: Home,
    color: "text-green-500",
    description: "Rentals, roommates, and housing"
  },
  { 
    value: "marketplace" as const, 
    label: "For Sale & Free", 
    icon: ShoppingBag,
    color: "text-emerald-500",
    description: "Buy, sell, or give away items"
  },
  { 
    value: "recommendation" as const, 
    label: "Recommendation", 
    icon: Heart,
    color: "text-pink-500",
    description: "Recommend local businesses or services"
  },
  { 
    value: "safety_alert" as const, 
    label: "Safety Alert", 
    icon: Shield,
    color: "text-red-600",
    description: "Important safety information for the community"
  },
  { 
    value: "travel_companion" as const, 
    label: "Travel Companion", 
    icon: Users,
    color: "text-cyan-500",
    description: "Find travel companions and travel buddies"
  }
];

const CreatePostDialog = ({ isOpen, onClose, communityId = "general", onPostCreated }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<Database['public']['Enums']['post_type']>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event-specific fields using unified structure
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_type: '',
    is_virtual: false,
    start_date: '',
    end_date: '',
    location: '',
    address: '',
    max_attendees: '',
    is_free: true,
    ticket_price: ''
  });

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

  // Travel Companion fields
  const [travelData, setTravelData] = useState({
    title: '',
    description: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelStyle: '',
    groupSize: '',
    transportation: '',
    budgetRange: '',
    specialRequirements: ''
  });

  // Job fields
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    jobTitle: '',
    companyName: '',
    employmentType: '',
    salaryRange: '',
    experienceRequired: '',
    skills: '',
    applicationDeadline: '',
    contactMethod: '',
    isRemote: false,
    location: ''
  });

  // Housing fields
  const [housingData, setHousingData] = useState({
    title: '',
    description: '',
    propertyType: '',
    rentRange: '',
    availableFrom: '',
    furnishingStatus: '',
    amenities: [] as string[],
    tenantType: '',
    securityDeposit: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    preferences: ''
  });

  // Safety Alert fields
  const [safetyData, setSafetyData] = useState({
    title: '',
    description: '',
    alertType: '',
    urgencyLevel: '',
    affectedArea: '',
    timeOfIncident: '',
    authoritiesContacted: false,
    emergencyContacts: ''
  });

  const selectedPostType = postTypes.find(type => type.value === selectedType);
  const isSpecializedType = ['event', 'marketplace', 'travel_companion', 'job', 'housing', 'safety_alert'].includes(selectedType);

  const handleTypeChange = (type: Database['public']['Enums']['post_type']) => {
    setSelectedType(type);
    // Reset form fields when switching types
    if (type !== 'event') {
      setEventData({
        title: '',
        description: '',
        event_type: '',
        is_virtual: false,
        start_date: '',
        end_date: '',
        location: '',
        address: '',
        max_attendees: '',
        is_free: true,
        ticket_price: ''
      });
    }
    if (type !== 'marketplace') {
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
    }
    // Reset other category data as needed
    if (type !== 'travel_companion') {
      setTravelData({
        title: '',
        description: '',
        destination: '',
        departureDate: '',
        returnDate: '',
        travelStyle: '',
        groupSize: '',
        transportation: '',
        budgetRange: '',
        specialRequirements: ''
      });
    }
    if (type !== 'job') {
      setJobData({
        title: '',
        description: '',
        jobTitle: '',
        companyName: '',
        employmentType: '',
        salaryRange: '',
        experienceRequired: '',
        skills: '',
        applicationDeadline: '',
        contactMethod: '',
        isRemote: false,
        location: ''
      });
    }
    if (type !== 'housing') {
      setHousingData({
        title: '',
        description: '',
        propertyType: '',
        rentRange: '',
        availableFrom: '',
        furnishingStatus: '',
        amenities: [],
        tenantType: '',
        securityDeposit: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        preferences: ''
      });
    }
    if (type !== 'safety_alert') {
      setSafetyData({
        title: '',
        description: '',
        alertType: '',
        urgencyLevel: '',
        affectedArea: '',
        timeOfIncident: '',
        authoritiesContacted: false,
        emergencyContacts: ''
      });
    }
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

  const handleEventDataChange = (field: string, value: any) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleMarketplaceDataChange = (field: string, value: any) => {
    setMarketplaceData(prev => ({ ...prev, [field]: value }));
  };

  const handleTravelDataChange = (field: string, value: any) => {
    setTravelData(prev => ({ ...prev, [field]: value }));
  };

  const handleJobDataChange = (field: string, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleHousingDataChange = (field: string, value: any) => {
    setHousingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSafetyDataChange = (field: string, value: any) => {
    setSafetyData(prev => ({ ...prev, [field]: value }));
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

  const getFormData = () => {
    switch (selectedType) {
      case 'marketplace':
        return { title: marketplaceData.title, content: marketplaceData.description };
      case 'event':
        return { title: eventData.title, content: eventData.description };
      case 'travel_companion':
        return { title: travelData.title, content: travelData.description };
      case 'job':
        return { title: jobData.title, content: jobData.description };
      case 'housing':
        return { title: housingData.title, content: housingData.description };
      case 'safety_alert':
        return { title: safetyData.title, content: safetyData.description };
      default:
        return { title, content };
    }
  };

  const validateForm = () => {
    const { title: postTitle, content: postContent } = getFormData();
    if (!postTitle.trim() || !postContent.trim()) return false;

    // Additional validation for specific types
    if (selectedType === 'event' && (!eventData.start_date || !eventData.event_type)) return false;
    if (selectedType === 'marketplace' && !marketplaceData.category) return false;
    if (selectedType === 'travel_companion' && (!travelData.destination || !travelData.departureDate)) return false;
    if (selectedType === 'job' && (!jobData.jobTitle || !jobData.employmentType)) return false;
    if (selectedType === 'housing' && (!housingData.propertyType || !housingData.rentRange)) return false;
    if (selectedType === 'safety_alert' && (!safetyData.alertType || !safetyData.urgencyLevel)) return false;

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedType || !user || !validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { title: postTitle, content: postContent } = getFormData();

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

      // Create corresponding specialized entries
      if (selectedType === 'event' && postResult) {
        const eventEntryData = {
          title: postTitle.trim(),
          description: postContent.trim(),
          start_date: eventData.start_date,
          end_date: eventData.end_date || null,
          location: eventData.location || null,
          address: eventData.address || null,
          max_attendees: eventData.max_attendees ? parseInt(eventData.max_attendees) : null,
          ticket_price: eventData.is_free ? null : (eventData.ticket_price ? parseFloat(eventData.ticket_price) : null),
          is_free: eventData.is_free,
          is_virtual: eventData.is_virtual,
          event_type: eventData.event_type as Database['public']['Enums']['event_type'],
          organizer_id: user.id,
          community_id: communityId && communityId !== "general" ? communityId : null,
          source: 'post' as const,
          post_id: postResult.id,
          image_url: mediaUrls.length > 0 ? mediaUrls[0] : null
        };

        const { error: eventError } = await supabase
          .from('events')
          .insert(eventEntryData);

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

      if (selectedType === 'travel_companion' && postResult) {
        // No specific table for travel companions, just create the post
      }

      if (selectedType === 'job' && postResult) {
        // No specific table for jobs, just create the post
      }

      if (selectedType === 'housing' && postResult) {
        // No specific table for housing, just create the post
      }

      if (selectedType === 'safety_alert' && postResult) {
        // No specific table for safety alerts, just create the post
      }

      toast.success("Post created successfully!");
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
    setSelectedType('discussion');
    setTitle('');
    setContent('');
    setMediaFiles([]);
    // Reset all category-specific data
    setEventData({
      title: '', description: '', event_type: '', is_virtual: false,
      start_date: '', end_date: '', location: '', address: '',
      max_attendees: '', is_free: true, ticket_price: ''
    });
    setMarketplaceData({
      title: '', description: '', category: '', price: '', location: '',
      isNegotiable: true, contactPhone: '', contactEmail: '', preferredContact: ''
    });
    setMarketplaceImages([]);
    setTravelData({
      title: '', description: '', destination: '', departureDate: '', returnDate: '',
      travelStyle: '', groupSize: '', transportation: '', budgetRange: '', specialRequirements: ''
    });
    setJobData({
      title: '', description: '', jobTitle: '', companyName: '', employmentType: '',
      salaryRange: '', experienceRequired: '', skills: '', applicationDeadline: '',
      contactMethod: '', isRemote: false, location: ''
    });
    setHousingData({
      title: '', description: '', propertyType: '', rentRange: '', availableFrom: '',
      furnishingStatus: '', amenities: [], tenantType: '', securityDeposit: '',
      location: '', bedrooms: '', bathrooms: '', preferences: ''
    });
    setSafetyData({
      title: '', description: '', alertType: '', urgencyLevel: '', affectedArea: '',
      timeOfIncident: '', authoritiesContacted: false, emergencyContacts: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gray-50/30 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 border-b border-gray-200/50">
          <DialogTitle className={`flex items-center gap-2 text-gray-700`}>
            {selectedPostType && <selectedPostType.icon className={`w-5 h-5 ${selectedPostType.color}`} />}
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Post Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="post-type">Post Category</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select post category" />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedPostType && (
              <p className="text-sm text-muted-foreground">{selectedPostType.description}</p>
            )}
          </div>

          {/* Category indicator badge */}
          {selectedPostType && (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-gray-100 border border-gray-300">
              <selectedPostType.icon className={`w-3 h-3 ${selectedPostType.color}`} />
              {selectedPostType.label}
            </Badge>
          )}

          {/* Category-specific form fields */}
          {selectedType === 'event' ? (
            <div className="bg-gray-50/30 p-4 rounded-lg border border-gray-200/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-post-title">Event Title *</Label>
                  <Input
                    id="event-post-title"
                    value={eventData.title}
                    onChange={(e) => handleEventDataChange('title', e.target.value)}
                    placeholder="e.g., Diwali Celebration 2024"
                    className="border-gray-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-post-description">Event Description *</Label>
                  <Textarea
                    id="event-post-description"
                    value={eventData.description}
                    onChange={(e) => handleEventDataChange('description', e.target.value)}
                    placeholder="Describe your event, activities, and what attendees can expect..."
                    rows={4}
                    className="border-gray-300"
                  />
                </div>
              </div>

              <EventFormFields
                formData={eventData}
                onFormDataChange={handleEventDataChange}
                showTitle={false}
                showDescription={false}
              />
            </div>
          ) : selectedType === 'marketplace' ? (
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
          ) : selectedType === 'travel_companion' ? (
            <TravelCompanionFormFields
              formData={travelData}
              onFormDataChange={handleTravelDataChange}
              showTitle={true}
              showDescription={true}
            />
          ) : selectedType === 'job' ? (
            <JobFormFields
              formData={jobData}
              onFormDataChange={handleJobDataChange}
              showTitle={true}
              showDescription={true}
            />
          ) : selectedType === 'housing' ? (
            <HousingFormFields
              formData={housingData}
              onFormDataChange={handleHousingDataChange}
              showTitle={true}
              showDescription={true}
            />
          ) : selectedType === 'safety_alert' ? (
            <SafetyAlertFormFields
              formData={safetyData}
              onFormDataChange={handleSafetyDataChange}
              showTitle={true}
              showDescription={true}
            />
          ) : (
            <div className="bg-gray-50/30 p-4 rounded-lg border border-gray-200/50">
              {/* Standard post fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your post about?"
                    className="mt-2 border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Description *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share more details..."
                    rows={6}
                    className="mt-2 border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media Upload for non-marketplace posts */}
          {selectedType !== 'marketplace' && (
            <div className="bg-gray-50/30 p-4 rounded-lg border border-gray-200/50">
              <Label>Photos (optional)</Label>
              <div className="mt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-gray-300"
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
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !validateForm()}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
