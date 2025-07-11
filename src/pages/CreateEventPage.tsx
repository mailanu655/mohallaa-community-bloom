import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, Users, DollarSign, Monitor, MapPinIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'cultural' as const,
    is_virtual: false,
    start_date: '',
    end_date: '',
    location: '',
    address: '',
    max_attendees: '',
    is_free: true,
    ticket_price: ''
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        is_virtual: formData.is_virtual,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        location: formData.location,
        address: formData.address,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        is_free: formData.is_free,
        ticket_price: formData.is_free ? null : parseFloat(formData.ticket_price),
        organizer_id: user.id
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;

      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });

      navigate('/events');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create Cultural Event</h1>
        <p className="text-muted-foreground">
          Organize festivals, meetups, and celebrations for your Indian community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Diwali Celebration 2024"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event, activities, and what attendees can expect..."
                rows={4}
              />
            </div>

            {/* Event Format */}
            <div className="space-y-2">
              <Label htmlFor="event_format">Event Format</Label>
              <Select value={formData.is_virtual ? 'virtual' : 'in-person'} onValueChange={(value) => handleInputChange('is_virtual', value === 'virtual')}>
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
              <Label htmlFor="event_type">Event Type</Label>
              <Select value={formData.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                <SelectTrigger>
                  <SelectValue />
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
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
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
                  onChange={(e) => handleInputChange('location', e.target.value)}
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
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Community Center, Temple, Park"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
                onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => handleInputChange('is_free', checked as boolean)}
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
                    onChange={(e) => handleInputChange('ticket_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.start_date}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventPage;