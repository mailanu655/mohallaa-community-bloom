import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  Trash2,
  Crown,
  BarChart3,
  CreditCard,
  MessageSquare,
  Heart,
  Users,
  CheckCircle,
  Award,
  TrendingUp,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { BusinessAnalytics } from '@/components/BusinessAnalytics';
import { BusinessPostCard } from '@/components/BusinessPostCard';
import { BusinessReviewCard } from '@/components/BusinessReviewCard';
import { CreateBusinessPostDialog } from '@/components/CreateBusinessPostDialog';
import { CreateReviewDialog } from '@/components/CreateReviewDialog';
import { BusinessDealsCard } from '@/components/BusinessDealsCard';

const BusinessPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [businessPosts, setBusinessPosts] = useState([]);
  const [businessReviews, setBusinessReviews] = useState([]);
  const [businessDeals, setBusinessDeals] = useState([]);
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

      // Fetch business posts
      const { data: postsData } = await supabase
        .from('business_posts')
        .select(`
          *,
          businesses(id, name, image_url, is_verified, city, state),
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('business_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setBusinessPosts(postsData || []);

      // Fetch business reviews
      const { data: reviewsData } = await supabase
        .from('business_reviews')
        .select(`
          *,
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('business_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      setBusinessReviews(reviewsData || []);

      // Fetch active deals
      const { data: dealsData } = await supabase
        .from('business_deals')
        .select(`
          *,
          businesses(name, city, state)
        `)
        .eq('business_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setBusinessDeals(dealsData || []);

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

  const handlePostEngagement = async (postId: string, type: 'like' | 'comment' | 'share') => {
    if (!user) {
      toast.error('Please sign in to interact with posts');
      return;
    }

    try {
      // Get current post data
      const { data: currentPost, error: fetchError } = await supabase
        .from('business_posts')
        .select('engagement_count, view_count')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      // Update engagement count
      const { error } = await supabase
        .from('business_posts')
        .update({ 
          engagement_count: (currentPost.engagement_count || 0) + 1,
          view_count: type === 'like' ? (currentPost.view_count || 0) + 1 : currentPost.view_count
        })
        .eq('id', postId);

      if (error) throw error;

      if (type === 'like') {
        toast.success('Thanks for your engagement!');
      } else if (type === 'comment') {
        // For future implementation - open comment dialog
        toast.info('Comments feature coming soon!');
      } else if (type === 'share') {
        // For future implementation - share functionality
        toast.info('Share feature coming soon!');
      }

      // Refresh posts
      fetchBusinessData();
    } catch (error) {
      console.error('Error handling engagement:', error);
      toast.error('Failed to update engagement');
    }
  };

  const handleReviewHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error('Please sign in to mark reviews as helpful');
      return;
    }

    try {
      // Get current review data
      const { data: currentReview, error: fetchError } = await supabase
        .from('business_reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('business_reviews')
        .update({ helpful_count: (currentReview.helpful_count || 0) + 1 })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      fetchBusinessData();
    } catch (error) {
      console.error('Error updating helpful count:', error);
      toast.error('Failed to update helpful count');
    }
  };

  const handleDealRedeem = (dealId: string) => {
    if (!user) {
      toast.error('Please sign in to redeem deals');
      navigate('/auth');
      return;
    }
    
    // For future implementation - deal redemption flow
    toast.info('Deal redemption feature coming soon! Contact the business directly.');
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
                    <Button variant="outline" size="sm" onClick={() => navigate(`/business/${id}/subscription`)}>
                      <Crown className="w-4 h-4 mr-2" />
                      {business.subscription_tier && business.subscription_tier !== 'basic' ? 'Manage Subscription' : 'Upgrade'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/business/${id}/manage`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                )}
              </div>

              {/* Subscription Status */}
              {business.subscription_tier && business.subscription_tier !== 'basic' && (
                <div className="mb-4">
                  <Badge className="bg-gradient-primary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    {business.subscription_tier.charAt(0).toUpperCase() + business.subscription_tier.slice(1)} Business
                  </Badge>
                </div>
              )}

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

      {/* Business Overview Stats */}
      {(business.rating || business.review_count || businessPosts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {business.rating && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold">{business.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {business.review_count} review{business.review_count !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{businessPosts.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Business Posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Tag className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{businessDeals.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Deals</p>
            </CardContent>
          </Card>

          {business.is_verified && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold">VERIFIED</span>
                </div>
                <p className="text-sm text-muted-foreground">Mohallaa Verified</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Services and Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts ({businessPosts.length})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({businessReviews.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({businessDeals.length})</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          {isOwner && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Posts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Updates
                    </CardTitle>
                    {isOwner && (
                      <CreateBusinessPostDialog 
                        businessId={id!} 
                        onPostCreated={fetchBusinessData}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {businessPosts.length > 0 ? (
                    <div className="space-y-4">
                      {businessPosts.slice(0, 3).map((post) => (
                        <BusinessPostCard
                          key={post.id}
                          post={post}
                          onEngagement={handlePostEngagement}
                        />
                      ))}
                      {businessPosts.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const postsTab = tabsList?.querySelector('[value="posts"]') as HTMLElement;
                            postsTab?.click();
                          }}
                        >
                          View All Posts ({businessPosts.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Posts Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {isOwner 
                          ? 'Share updates and connect with your community by creating your first post.' 
                          : 'This business hasn\'t shared any updates yet.'
                        }
                      </p>
                      {isOwner && (
                        <CreateBusinessPostDialog 
                          businessId={id!} 
                          onPostCreated={fetchBusinessData}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Reviews & Deals Sidebar */}
            <div className="space-y-6">
              {/* Latest Reviews */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Latest Reviews
                    </CardTitle>
                    {!isOwner && user && (
                      <CreateReviewDialog
                        businessId={id!}
                        businessName={business.name}
                        onReviewCreated={fetchBusinessData}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {businessReviews.length > 0 ? (
                    <div className="space-y-4">
                      {businessReviews.slice(0, 2).map((review) => (
                        <BusinessReviewCard
                          key={review.id}
                          review={review}
                          onHelpful={handleReviewHelpful}
                        />
                      ))}
                      {businessReviews.length > 2 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const reviewsTab = tabsList?.querySelector('[value="reviews"]') as HTMLElement;
                            reviewsTab?.click();
                          }}
                        >
                          View All Reviews
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No reviews yet</p>
                      {!isOwner && user && (
                        <CreateReviewDialog
                          businessId={id!}
                          businessName={business.name}
                          onReviewCreated={fetchBusinessData}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Deals */}
              {businessDeals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Current Deals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {businessDeals.slice(0, 2).map((deal) => (
                        <BusinessDealsCard
                          key={deal.id}
                          deal={deal}
                          onRedeem={handleDealRedeem}
                        />
                      ))}
                      {businessDeals.length > 2 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const dealsTab = tabsList?.querySelector('[value="deals"]') as HTMLElement;
                            dealsTab?.click();
                          }}
                        >
                          View All Deals
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Business Posts</CardTitle>
                {isOwner && (
                  <CreateBusinessPostDialog 
                    businessId={id!} 
                    onPostCreated={fetchBusinessData}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {businessPosts.length > 0 ? (
                <div className="space-y-6">
                  {businessPosts.map((post) => (
                    <BusinessPostCard
                      key={post.id}
                      post={post}
                      onEngagement={handlePostEngagement}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwner 
                      ? 'Start engaging with your community by creating your first post.' 
                      : 'This business hasn\'t shared any posts yet.'
                    }
                  </p>
                  {isOwner && (
                    <CreateBusinessPostDialog 
                      businessId={id!} 
                      onPostCreated={fetchBusinessData}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Reviews</CardTitle>
                {!isOwner && user && (
                  <CreateReviewDialog
                    businessId={id!}
                    businessName={business.name}
                    onReviewCreated={fetchBusinessData}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {businessReviews.length > 0 ? (
                <div className="space-y-6">
                  {businessReviews.map((review) => (
                    <BusinessReviewCard
                      key={review.id}
                      review={review}
                      onHelpful={handleReviewHelpful}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwner 
                      ? 'Encourage your customers to leave reviews and build your reputation.' 
                      : 'Be the first to review this business and help your community.'
                    }
                  </p>
                  {!isOwner && user && (
                    <CreateReviewDialog
                      businessId={id!}
                      businessName={business.name}
                      onReviewCreated={fetchBusinessData}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Special Deals & Offers</CardTitle>
            </CardHeader>
            <CardContent>
              {businessDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessDeals.map((deal) => (
                    <BusinessDealsCard
                      key={deal.id}
                      deal={deal}
                      onRedeem={handleDealRedeem}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Active Deals</h3>
                  <p className="text-muted-foreground">
                    {isOwner 
                      ? 'Create special deals to attract more customers.' 
                      : 'This business doesn\'t have any active deals right now.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
          <TabsContent value="manage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.slice(0, 5).map((appointment) => (
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
                      {appointments.length === 0 && (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">No Appointments</h3>
                          <p className="text-muted-foreground">
                            No appointments scheduled yet.
                          </p>
                        </div>
                      )}
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

              {/* Business Management Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/business/${id}/manage`)}
                      className="justify-start gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Business Details
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/business/${id}/add-service`)}
                      className="justify-start gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Service
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/business/${id}/subscription`)}
                      className="justify-start gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      {business.subscription_tier && business.subscription_tier !== 'basic' ? 'Manage Subscription' : 'Upgrade Plan'}
                    </Button>
                  </div>

                  <Separator />

                  <BusinessAnalytics 
                    businessId={id}
                    isPremium={business.subscription_tier === 'premium' || business.subscription_tier === 'enterprise'}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessPage;