import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  ShoppingBag,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      // Fetch recent posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name, city, state)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

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

      setPosts(postsData || []);
      setEvents(eventsData || []);
      setMarketplaceItems(marketplaceData || []);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to Your Neighborhood
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay connected with your local Indian community. Discover events, browse marketplace items, and engage in neighborhood discussions.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{posts.length}</div>
            <div className="text-sm text-muted-foreground">Recent Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{marketplaceItems.length}</div>
            <div className="text-sm text-muted-foreground">For Sale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Communities</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Neighborhood Feed</span>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/posts">View All Posts</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground space-x-2">
                            {post.communities && (
                              <>
                                <MapPin className="w-3 h-3" />
                                <span>{post.communities.city}, {post.communities.state}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={post.post_type === 'announcement' ? 'default' : 'secondary'}>
                        {post.post_type}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        <Link to={`/post/${post.id}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.upvotes || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comment_count || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Upcoming Events</span>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/events">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="space-y-2">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">For Sale & Free</span>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/marketplace">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketplaceItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.price ? `$${item.price}` : 'Free'}
                      </Badge>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="cultural" className="w-full justify-start" asChild>
                <Link to="/posts/create">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Create Post
                </Link>
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
  );
};

export default HomePage;