import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  MessageSquare, 
  Calendar,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Sparkles,
  Bell,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostModal from '@/components/CreatePostModal';
import FeedSortTabs from '@/components/FeedSortTabs';
import EnhancedPostCard from '@/components/EnhancedPostCard';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [feedSort, setFeedSort] = useState('for-you');
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(3);

  useEffect(() => {
    fetchFeedData();
  }, [feedSort]);

  const fetchFeedData = async () => {
    try {
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `);

      // Apply sorting based on feed type
      switch (feedSort) {
        case 'for-you':
          // Personalized feed - mix of popular and relevant content
          postsQuery = postsQuery
            .order('upvotes', { ascending: false })
            .order('created_at', { ascending: false });
          break;
        case 'latest':
          postsQuery = postsQuery.order('created_at', { ascending: false });
          break;
        case 'nearby':
          // TODO: Add location-based filtering
          postsQuery = postsQuery.order('created_at', { ascending: false });
          break;
        case 'trending':
          postsQuery = postsQuery
            .order('comment_count', { ascending: false })
            .order('upvotes', { ascending: false });
          break;
        default:
          postsQuery = postsQuery.order('created_at', { ascending: false });
      }

      const { data: postsData } = await postsQuery.limit(15);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          communities(name, city, state),
          profiles!inner(first_name, last_name)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      // Fetch recent marketplace items
      const { data: marketplaceData } = await supabase
        .from('marketplace')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch trending businesses
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id, name, rating, review_count, category, image_url')
        .order('rating', { ascending: false })
        .limit(5);

      setPosts(postsData || []);
      setEvents(eventsData || []);
      setMarketplaceItems(marketplaceData || []);
      setBusinesses(businessData || []);
    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Your <span className="text-primary">Mohallaa</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Stay connected with your local Indian community. Discover events, get local recommendations, and engage in meaningful neighborhood conversations.
          </p>
        </div>

        {/* Create Post Prompt */}
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="ghost" 
                className="flex-1 justify-start text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background h-14 text-lg rounded-xl border border-border/50"
                onClick={() => setCreatePostModalOpen(true)}
              >
                What's happening in your neighborhood?
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed Sort Tabs */}
        <FeedSortTabs 
          activeSort={feedSort} 
          onSortChange={setFeedSort}
          alertsCount={alertsCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post, index) => (
              <EnhancedPostCard 
                key={post.id} 
                post={post}
                isHighlighted={feedSort === 'for-you' && index < 2}
                showConnection={feedSort === 'for-you' && Math.random() > 0.7}
              />
            ))}

            {posts.length === 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">Your feed is empty</h3>
                      <p className="text-muted-foreground">
                        Be the first to share something with your neighborhood!
                      </p>
                    </div>
                    <Button 
                      variant="default"
                      onClick={() => setCreatePostModalOpen(true)}
                    >
                      Create First Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Upcoming Events */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg">Events</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/events">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="space-y-2 p-3 rounded-lg hover:bg-background/50 transition-colors">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    <Badge variant={event.is_free ? 'secondary' : 'outline'} className="text-xs">
                      {event.is_free ? 'Free' : `$${event.ticket_price}`}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Marketplace Items */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-lg">For Sale & Free</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/marketplace">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketplaceItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-background/50 transition-colors">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">
                          {item.price ? `$${item.price}` : 'FREE'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.profiles?.first_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="default" 
                  className="w-full justify-start" 
                  onClick={() => setCreatePostModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/events/create">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/marketplace/create">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    List Item
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        open={createPostModalOpen} 
        onOpenChange={setCreatePostModalOpen}
      />
    </div>
  );
};

export default HomePage;