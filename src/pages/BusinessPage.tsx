import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const BusinessPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBusinessData();
    }
  }, [id, user]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) throw businessError;

      setBusiness(businessData);
      setIsOwner(user?.id === businessData.owner_id);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setServices(servicesData || []);

      // Fetch appointments if owner
      if (user?.id === businessData.owner_id) {
        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select(`
            *,
            services(name, duration_minutes),
            profiles(first_name, last_name, avatar_url)
          `)
          .eq('business_id', id)
          .order('appointment_date', { ascending: true });

        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const formatBusinessHours = (hours) => {
    if (!hours) return 'Hours not set';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const dayInfo = hours[day];
      if (!dayInfo || dayInfo.closed) {
        return `${dayLabels[index]}: Closed`;
      }
      return `${dayLabels[index]}: ${dayInfo.open} - ${dayInfo.close}`;
    }).join(' | ');
  };

  const bookService = (serviceId) => {
    if (!user) {
      toast.error('Please sign in to book a service');
      navigate('/auth');
      return;
    }
    navigate(`/book-service/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Business not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Business Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
              {business.image_url ? (
                <img 
                  src={business.image_url} 
                  alt={business.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {business.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{business.name}</h1>
                  <Badge variant="secondary" className="mb-2">
                    {business.category?.charAt(0).toUpperCase() + business.category?.slice(1).replace('_', ' ')}
                  </Badge>
                  {business.description && (
                    <p className="text-muted-foreground mb-4">{business.description}</p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/business/${id}/manage`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{business.address}, {business.city}, {business.state}</span>
                </div>
                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{business.email}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {business.business_hours && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatBusinessHours(business.business_hours)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services and Management Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          {isOwner && <TabsTrigger value="appointments">Appointments</TabsTrigger>}
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Services</CardTitle>
                {isOwner && (
                  <Button onClick={() => navigate(`/business/${id}/add-service`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-sm">
                            {service.price && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-medium">${service.price}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          </div>
                        </div>
                        {service.category && (
                          <Badge variant="outline" className="mb-3">
                            {service.category}
                          </Badge>
                        )}
                        <Button 
                          onClick={() => bookService(service.id)}
                          className="w-full"
                          disabled={isOwner}
                        >
                          {isOwner ? 'Your Service' : 'Book Now'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Services Available</h3>
                  <p className="text-muted-foreground">
                    {isOwner ? 'Add your first service to start accepting bookings.' : 'This business has not added any services yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-border/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={appointment.profiles?.avatar_url} />
                              <AvatarFallback>
                                {appointment.customer_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{appointment.customer_name}</h4>
                              <p className="text-sm text-muted-foreground">{appointment.services?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                                {new Date(appointment.appointment_date).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {appointment.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Note: {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' :
                            appointment.status === 'completed' ? 'outline' : 'destructive'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Appointments</h3>
                    <p className="text-muted-foreground">
                      No appointments scheduled yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessPage;