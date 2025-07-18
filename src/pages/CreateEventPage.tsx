
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventFormFields from '@/components/events/EventFormFields';

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
        <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
        <p className="text-muted-foreground">
          Organize events, meetups, and celebrations for your community
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
            <EventFormFields
              formData={formData}
              onFormDataChange={handleInputChange}
              showTitle={true}
              showDescription={true}
            />

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
