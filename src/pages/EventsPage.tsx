import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, typeFilter, timeFilter]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }

    if (timeFilter && timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.start_date);
        switch (timeFilter) {
          case 'today':
            return isToday(eventDate);
          case 'tomorrow':
            return isTomorrow(eventDate);
          case 'this-week':
            return isThisWeek(eventDate);
          case 'free':
            return event.is_free;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  const getDateBadge = (dateString) => {
    const eventDate = parseISO(dateString);
    if (isToday(eventDate)) return { text: 'Today', variant: 'default' as const };
    if (isTomorrow(eventDate)) return { text: 'Tomorrow', variant: 'secondary' as const };
    if (isThisWeek(eventDate)) return { text: 'This Week', variant: 'outline' as const };
    return { text: format(eventDate, 'MMM d'), variant: 'outline' as const };
  };

  const eventTypes = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'professional', label: 'Professional' },
    { value: 'social', label: 'Social' },
    { value: 'religious', label: 'Religious' },
    { value: 'educational', label: 'Educational' }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 bg-muted/20 rounded w-32"></div>
            <div className="h-4 bg-muted/20 rounded w-64"></div>
          </div>
          <div className="h-10 bg-muted/20 rounded w-32"></div>
        </div>

        {/* Filters Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="h-10 bg-muted/20 rounded flex-1"></div>
              <div className="h-10 bg-muted/20 rounded w-48"></div>
              <div className="h-10 bg-muted/20 rounded w-40"></div>
              <div className="h-10 bg-muted/20 rounded w-20"></div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted/20 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-muted/20 rounded w-16"></div>
                      <div className="h-5 bg-muted/20 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16 bg-muted/20 rounded w-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/20 rounded w-full"></div>
                  <div className="h-4 bg-muted/20 rounded w-2/3"></div>
                  <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 bg-muted/20 rounded-full w-6"></div>
                    <div className="h-4 bg-muted/20 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-muted/20 rounded w-16"></div>
                </div>
                <div className="h-8 bg-muted/20 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">
            Discover and join events in your community
          </p>
        </div>
        <Button variant="cultural" asChild>
          <Link to="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="When" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="free">Free Events</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setTimeFilter('all');
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Sort by: Date</span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const dateBadge = getDateBadge(event.start_date);
          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={dateBadge.variant} className="text-xs">
                        {dateBadge.text}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {format(parseISO(event.start_date), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{event.current_attendees || 0} attending</span>
                    </div>
                    <Badge variant={event.is_free ? 'secondary' : 'outline'}>
                      {event.is_free ? 'Free' : `$${event.ticket_price}`}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {event.profiles?.first_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      by {event.profiles?.first_name}
                    </span>
                  </div>
                  
                  {event.communities && (
                    <span className="text-xs text-muted-foreground">
                      {event.communities.city}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search filters or create the first event in your area!
          </p>
          <Button variant="cultural" asChild>
            <Link to="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;