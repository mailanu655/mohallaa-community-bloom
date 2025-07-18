
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { ShoppingBag, DollarSign } from "lucide-react";

interface MarketplaceFormFieldsProps {
  formData: {
    title: string;
    description: string;
    category: string;
    price: string;
    location: string;
    isNegotiable: boolean;
    contactPhone: string;
    contactEmail: string;
    preferredContact: string;
  };
  onFormDataChange: (field: string, value: any) => void;
  images: File[];
  onImageUpload: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
  showTitle?: boolean;
  showDescription?: boolean;
}

const MarketplaceFormFields: React.FC<MarketplaceFormFieldsProps> = ({
  formData,
  onFormDataChange,
  images,
  onImageUpload,
  onRemoveImage,
  maxImages = 5,
  showTitle = true,
  showDescription = true,
}) => {
  const categories = [
    { value: 'goods', label: 'Goods' },
    { value: 'services', label: 'Services' },
    { value: 'housing', label: 'Housing' },
    { value: 'jobs', label: 'Jobs' }
  ];

  return (
    <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-green-600" />
        <Label className="text-sm font-medium">Listing Details</Label>
      </div>
      
      {showTitle && (
        <div>
          <Label htmlFor="marketplace-title">Title *</Label>
          <Input
            id="marketplace-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="What are you selling or offering?"
            className="mt-2"
          />
        </div>
      )}

      {showDescription && (
        <div>
          <Label htmlFor="marketplace-description">Description *</Label>
          <Textarea
            id="marketplace-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Provide details about your item or service..."
            rows={4}
            className="mt-2"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marketplace-category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => onFormDataChange('category', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="marketplace-price">Price ($)</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="marketplace-price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => onFormDataChange('price', e.target.value)}
              placeholder="0.00 (Leave empty for free)"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="marketplace-location">Location</Label>
        <Input
          id="marketplace-location"
          value={formData.location}
          onChange={(e) => onFormDataChange('location', e.target.value)}
          placeholder="Where is the item/service located?"
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="marketplace-negotiable"
          checked={formData.isNegotiable}
          onCheckedChange={(checked) => onFormDataChange('isNegotiable', checked)}
        />
        <Label htmlFor="marketplace-negotiable">Price is negotiable</Label>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-sm font-medium">Contact Information</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => onFormDataChange('contactPhone', e.target.value)}
              placeholder="(123) 456-7890"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => onFormDataChange('contactEmail', e.target.value)}
              placeholder="email@example.com"
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="preferred-contact">Preferred Contact Method</Label>
          <Select value={formData.preferredContact} onValueChange={(value) => onFormDataChange('preferredContact', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="How would you like to be contacted?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="both">Either Phone or Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4 pt-4 border-t">
        <Label>Photos (Optional)</Label>
        <FileUpload
          onFileSelect={onImageUpload}
          onFileRemove={onRemoveImage}
          multiple={true}
          accept="image/*"
          maxFiles={maxImages}
          selectedFiles={images}
          className="mt-2"
        >
          <div className="text-center py-4">
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images help sell your item faster • Max {maxImages} photos
            </p>
          </div>
        </FileUpload>
      </div>
    </div>
  );
};

export default MarketplaceFormFields;
