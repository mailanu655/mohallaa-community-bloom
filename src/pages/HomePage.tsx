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
  TrendingUp,
  Image,
  Video,
  BarChart3,
  FileText,
  Plus
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
  const [activeTab, setActiveTab] = useState('newest');
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

      {/* Create Post Section */}
      <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            
          </div>

          {/* Post creation area */}
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="w-12 h-12 bg-primary/10 text-primary font-semibold">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted"
                asChild
              >
                <Link to="/posts/create">
                  Ask a question to the community?
                </Link>
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <FileText className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/posts/create">
                  <FileText className="w-4 h-4 mr-2" />
                  Write Article
                </Link>
              </Button>
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/posts/create">
                  Post
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardContent className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10 bg-primary/10 text-primary font-semibold">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-foreground">
                              {post.profiles?.first_name} {post.profiles?.last_name}
                            </h4>
                            <Badge 
                              className={`text-xs px-2 py-1 ${
                                post.post_type === 'question' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                post.post_type === 'discussion' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                post.post_type === 'announcement' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                                'bg-purple-100 text-purple-700 hover:bg-purple-100'
                              }`}
                            >
                              {post.post_type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground leading-tight">
                            <Link to={`/post/${post.id}`} className="hover:text-primary transition-colors">
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        <div className="flex items-center space-x-6 mt-4 pt-2 text-sm text-muted-foreground">
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{post.upvotes || 23}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.comment_count || 8}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
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
            <CardContent className="space-y-4">
              {marketplaceItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {item.description}
                    </p>
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