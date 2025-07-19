
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TravelCompanionData {
  title: string;
  description: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelStyle: string;
  groupSize: string;
  transportation: string;
  budgetRange: string;
  specialRequirements: string;
}

interface TravelCompanionFormFieldsProps {
  formData: TravelCompanionData;
  onFormDataChange: (field: string, value: any) => void;
  showTitle?: boolean;
  showDescription?: boolean;
}

const TravelCompanionFormFields = ({ 
  formData, 
  onFormDataChange, 
  showTitle = true, 
  showDescription = true 
}: TravelCompanionFormFieldsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4 p-4 bg-gray-50/30 rounded-lg border border-gray-200/50">
      <div className="flex items-center gap-2 text-gray-700">
        <Users className="w-4 h-4 text-cyan-500" />
        <Label className="text-sm font-medium">Travel Companion Details</Label>
      </div>

      {/* Essential Fields */}
      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="travel-title">Trip Title *</Label>
          <Input
            id="travel-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="e.g., Looking for travel buddy to Goa"
            className="border-gray-300"
          />
        </div>
      )}

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="travel-description">Trip Description *</Label>
          <Textarea
            id="travel-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Describe your travel plans, what you're looking for in a travel companion..."
            rows={3}
            className="border-gray-300"
          />
        </div>
      )}

      {/* Important Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => onFormDataChange('destination', e.target.value)}
              placeholder="e.g., Goa, India"
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departure-date">Departure Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="departure-date"
              type="date"
              value={formData.departureDate}
              onChange={(e) => onFormDataChange('departureDate', e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="return-date">Return Date</Label>
          <Input
            id="return-date"
            type="date"
            value={formData.returnDate}
            onChange={(e) => onFormDataChange('returnDate', e.target.value)}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="travel-style">Travel Style</Label>
          <Select value={formData.travelStyle} onValueChange={(value) => onFormDataChange('travelStyle', value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Select travel style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget Travel</SelectItem>
              <SelectItem value="comfort">Comfort Travel</SelectItem>
              <SelectItem value="luxury">Luxury Travel</SelectItem>
              <SelectItem value="adventure">Adventure Travel</SelectItem>
              <SelectItem value="backpacking">Backpacking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Fields - Progressive Disclosure */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto text-gray-600 hover:text-gray-800">
            <span className="text-sm font-medium">
              {showAdvanced ? 'Hide' : 'Show'} Additional Options
            </span>
            <span className="text-xs">{showAdvanced ? '−' : '+'}</span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-size">Preferred Group Size</Label>
              <Select value={formData.groupSize} onValueChange={(value) => onFormDataChange('groupSize', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select group size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo (just me + 1)</SelectItem>
                  <SelectItem value="small">Small group (2-4 people)</SelectItem>
                  <SelectItem value="medium">Medium group (5-8 people)</SelectItem>
                  <SelectItem value="large">Large group (9+ people)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportation">Transportation</Label>
              <Select value={formData.transportation} onValueChange={(value) => onFormDataChange('transportation', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select transportation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="car">Car/Road Trip</SelectItem>
                  <SelectItem value="mixed">Mixed Transportation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-range">Budget Range (per person)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select value={formData.budgetRange} onValueChange={(value) => onFormDataChange('budgetRange', value)}>
                <SelectTrigger className="pl-10 border-gray-300">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-5000">Under ₹5,000</SelectItem>
                  <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                  <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
                  <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                  <SelectItem value="above-50000">Above ₹50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-requirements">Special Requirements/Interests</Label>
            <Textarea
              id="special-requirements"
              value={formData.specialRequirements}
              onChange={(e) => onFormDataChange('specialRequirements', e.target.value)}
              placeholder="e.g., Vegetarian food preferences, photography enthusiast, early riser, specific interests..."
              rows={3}
              className="border-gray-300"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TravelCompanionFormFields;
