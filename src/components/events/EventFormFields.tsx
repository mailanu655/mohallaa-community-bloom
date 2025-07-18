
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, Monitor, MapPinIcon, Users, DollarSign } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  is_virtual: boolean;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  max_attendees: string;
  is_free: boolean;
  ticket_price: string;
}

interface EventFormFieldsProps {
  formData: EventFormData;
  onFormDataChange: (field: string, value: string | boolean) => void;
  showTitle?: boolean;
  showDescription?: boolean;
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({
  formData,
  onFormDataChange,
  showTitle = false,
  showDescription = false
}) => {
  return (
    <div className="space-y-6">
      {/* Title - only show if explicitly requested */}
      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="event-title">Event Title *</Label>
          <Input
            id="event-title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            placeholder="e.g., Diwali Celebration 2024"
          />
        </div>
      )}

      {/* Description - only show if explicitly requested */}
      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Describe your event, activities, and what attendees can expect..."
            rows={4}
          />
        </div>
      )}

      {/* Event Format */}
      <div className="space-y-2">
        <Label htmlFor="event_format">Event Format</Label>
        <Select 
          value={formData.is_virtual ? 'virtual' : 'in-person'} 
          onValueChange={(value) => onFormDataChange('is_virtual', value === 'virtual')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-person">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                In-Person Event
              </div>
            </SelectItem>
            <SelectItem value="virtual">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Virtual Event
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <Label htmlFor="event_type">Event Type *</Label>
        <Select value={formData.event_type} onValueChange={(value) => onFormDataChange('event_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cultural">Cultural Festival</SelectItem>
            <SelectItem value="social">Social Meetup</SelectItem>
            <SelectItem value="religious">Religious Gathering</SelectItem>
            <SelectItem value="educational">Educational Workshop</SelectItem>
            <SelectItem value="professional">Professional Networking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date & Time *</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => onFormDataChange('start_date', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date & Time</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => onFormDataChange('end_date', e.target.value)}
          />
        </div>
      </div>

      {/* Location */}
      {formData.is_virtual ? (
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Meeting Platform
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onFormDataChange('location', e.target.value)}
            placeholder="e.g., Zoom, Google Meet, Teams"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue Name
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onFormDataChange('location', e.target.value)}
              placeholder="e.g., Community Center, Temple, Park"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onFormDataChange('address', e.target.value)}
              placeholder="Street address, city, state, zip code"
            />
          </div>
        </div>
      )}

      {/* Capacity */}
      <div className="space-y-2">
        <Label htmlFor="max_attendees" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Maximum Attendees (Optional)
        </Label>
        <Input
          id="max_attendees"
          type="number"
          value={formData.max_attendees}
          onChange={(e) => onFormDataChange('max_attendees', e.target.value)}
          placeholder="Leave empty for unlimited"
        />
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_free"
            checked={formData.is_free}
            onCheckedChange={(checked) => onFormDataChange('is_free', checked as boolean)}
          />
          <Label htmlFor="is_free">This is a free event</Label>
        </div>
        
        {!formData.is_free && (
          <div className="space-y-2">
            <Label htmlFor="ticket_price" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ticket Price
            </Label>
            <Input
              id="ticket_price"
              type="number"
              step="0.01"
              value={formData.ticket_price}
              onChange={(e) => onFormDataChange('ticket_price', e.target.value)}
              placeholder="0.00"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFormFields;
