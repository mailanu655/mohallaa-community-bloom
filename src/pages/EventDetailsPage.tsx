import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Share2,
  DollarSign,
  Globe,
  MapPinIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import EventRSVPButton from '@/components/EventRSVPButton';
import EventAttendeesList from '@/components/EventAttendeesList';


const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted/20 rounded w-32 mb-6"></div>
          <div className="h-64 bg-muted/20 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-6 bg-muted/20 rounded w-3/4"></div>
            <div className="h-4 bg-muted/20 rounded w-1/2"></div>
            <div className="h-4 bg-muted/20 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Event not found</h3>
        <p className="text-muted-foreground mb-4">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/events')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Button>

      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {event.event_type}
                </Badge>
                <Badge variant={event.is_free ? 'secondary' : 'outline'}>
                  {event.is_free ? 'Free' : `$${event.ticket_price}`}
                </Badge>
                {event.is_virtual && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Virtual
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={event.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {event.profiles?.first_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    Organized by {event.profiles?.first_name || 'Unknown'} {event.profiles?.last_name || ''}
                  </span>
                </div>
                {event.communities && (
                  <span className="text-sm">
                    in {event.communities.city}, {event.communities.state}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <EventRSVPButton eventId={event.id} showAttendeeCount />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Event Image */}
          {event.image_url && (
            <Card>
              <CardContent className="p-0">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Event Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(parseISO(event.start_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(event.start_date), 'h:mm a')}
                    {event.end_date && ` - ${format(parseISO(event.end_date), 'h:mm a')}`}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground">
                        {event.address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {event.current_attendees || 0} attending
                    {event.max_attendees && ` (max ${event.max_attendees})`}
                  </p>
                </div>
              </div>

              {!event.is_free && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Ticket Price</p>
                    <p className="text-sm text-muted-foreground">
                      ${event.ticket_price}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees List */}
          <EventAttendeesList eventId={event.id} />
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;