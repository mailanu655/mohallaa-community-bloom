
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, DollarSign, Calendar, MapPin } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HousingData {
  title: string;
  description: string;
  propertyType: string;
  rentRange: string;
  availableFrom: string;
  furnishingStatus: string;
  amenities: string[];
  tenantType: string;
  securityDeposit: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  preferences: string;
}

interface HousingFormFieldsProps {
  formData: HousingData;
  onFormDataChange: (field: string, value: any) => void;
  showTitle?: boolean;
  showDescription?: boolean;
}

const HousingFormFields = ({ 
  formData, 
  onFormDataChange, 
  showTitle = true, 
  showDescription = true 
}: HousingFormFieldsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const amenitiesList = [
    'WiFi', 'Parking', 'Swimming Pool', 'Gym', 'Security', 'Power Backup',
    'Elevator', 'Balcony', 'Air Conditioning', 'Washing Machine', 'Refrigerator'
  ];

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    onFormDataChange('amenities', updatedAmenities);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50/30 rounded-lg border border-gray-200/50">
      <div className="flex items-center gap-2 text-gray-700">
        <Home className="w-4 h-4 text-green-500" />
        <Label className="text-sm font-medium">Housing Details</Label>
      </div>

      {/* Essential Fields */}
      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="housing-title">Property Title *</Label>
          <Input
            id="housing-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="e.g., 2BHK Apartment for Rent in Koramangala"
            className="border-gray-300"
          />
        </div>
      )}

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="housing-description">Property Description *</Label>
          <Textarea
            id="housing-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Describe the property, neighborhood, nearby amenities..."
            rows={3}
            className="border-gray-300"
          />
        </div>
      )}

      {/* Important Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property-type">Property Type *</Label>
          <Select value={formData.propertyType} onValueChange={(value) => onFormDataChange('propertyType', value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">Independent House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="room">Single Room</SelectItem>
              <SelectItem value="pg">PG/Hostel</SelectItem>
              <SelectItem value="studio">Studio Apartment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rent-range">Rent Range *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Select value={formData.rentRange} onValueChange={(value) => onFormDataChange('rentRange', value)}>
              <SelectTrigger className="pl-10 border-gray-300">
                <SelectValue placeholder="Select rent range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-10000">Under ₹10,000</SelectItem>
                <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
                <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                <SelectItem value="above-100000">Above ₹1,00,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="available-from">Available From</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="available-from"
              type="date"
              value={formData.availableFrom}
              onChange={(e) => onFormDataChange('availableFrom', e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="furnishing-status">Furnishing Status</Label>
          <Select value={formData.furnishingStatus} onValueChange={(value) => onFormDataChange('furnishingStatus', value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select furnishing status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fully-furnished">Fully Furnished</SelectItem>
              <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Fields - Progressive Disclosure */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto text-gray-600 hover:text-gray-800">
            <span className="text-sm font-medium">
              {showAdvanced ? 'Hide' : 'Show'} Additional Property Details
            </span>
            <span className="text-xs">{showAdvanced ? '−' : '+'}</span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select value={formData.bedrooms} onValueChange={(value) => onFormDataChange('bedrooms', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select value={formData.bathrooms} onValueChange={(value) => onFormDataChange('bathrooms', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="2">2 Bathrooms</SelectItem>
                  <SelectItem value="3">3 Bathrooms</SelectItem>
                  <SelectItem value="4">4+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-type">Preferred Tenant</Label>
              <Select value={formData.tenantType} onValueChange={(value) => onFormDataChange('tenantType', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select tenant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="bachelor">Bachelor</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="professionals">Working Professionals</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location/Area</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => onFormDataChange('location', e.target.value)}
                placeholder="e.g., Koramangala, Bangalore"
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-deposit">Security Deposit</Label>
            <Input
              id="security-deposit"
              value={formData.securityDeposit}
              onChange={(e) => onFormDataChange('securityDeposit', e.target.value)}
              placeholder="e.g., ₹25,000 or 2 months rent"
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities?.includes(amenity) || false}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Additional Preferences/Rules</Label>
            <Textarea
              id="preferences"
              value={formData.preferences}
              onChange={(e) => onFormDataChange('preferences', e.target.value)}
              placeholder="e.g., No smoking, No pets, Vegetarian only, etc."
              rows={3}
              className="border-gray-300"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HousingFormFields;
