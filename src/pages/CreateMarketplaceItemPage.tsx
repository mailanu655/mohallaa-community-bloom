
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MarketplaceFormFields from '@/components/marketplace/MarketplaceFormFields';

const CreateMarketplaceItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  const [images, setImages] = useState<File[]>([]);

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    if (newFiles.length + images.length > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }
    setImages(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      // Prepare contact info
      const contactInfo: any = {};
      if (formData.contactPhone) contactInfo.phone = formData.contactPhone;
      if (formData.contactEmail) contactInfo.email = formData.contactEmail;
      if (formData.preferredContact) contactInfo.preferred = formData.preferredContact;

      const { data, error } = await supabase
        .from('marketplace')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category as any,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location,
          is_negotiable: formData.isNegotiable,
          seller_id: user.id,
          images: imageUrls.length > 0 ? imageUrls : null,
          contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null,
          source: 'dedicated'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });

      navigate('/marketplace');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">List an Item</h1>
          <p className="text-muted-foreground">
            Create a new listing for your community
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <MarketplaceFormFields
              formData={formData}
              onFormDataChange={handleFormDataChange}
              images={images}
              onImageUpload={handleImageUpload}
              onRemoveImage={removeImage}
              maxImages={5}
              showTitle={true}
              showDescription={true}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.description || !formData.category}
                className="flex-1"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMarketplaceItemPage;
