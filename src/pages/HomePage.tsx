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
  Search,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostModal from '@/components/CreatePostModal';
import FeedSortTabs from '@/components/FeedSortTabs';
import EnhancedPostCard from '@/components/EnhancedPostCard';
import PostDetailModal from '@/components/PostDetailModal';

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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postDetailModalOpen, setPostDetailModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setPostDetailModalOpen(true);
  };

  const handleClosePostModal = () => {
    setPostDetailModalOpen(false);
    setSelectedPostId(null);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto border-x border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-4 min-h-screen">
          {/* Left Sidebar - Navigation */}
          <div className="hidden lg:block border-r border-border/50 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Mohallaa</h2>
              
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/home">
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/communities">
                    <Users className="w-5 h-5 mr-3" />
                    Communities
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/events">
                    <Calendar className="w-5 h-5 mr-3" />
                    Events
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/marketplace">
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    Marketplace
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/businesses">
                    <Users className="w-5 h-5 mr-3" />
                    Businesses
                  </Link>
                </Button>
              </nav>
            </div>

            <Button 
              className="w-full" 
              onClick={() => setCreatePostModalOpen(true)}
            >
              Post
            </Button>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 border-r border-border/50">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-foreground">Home</h1>
              </div>
            </div>

            {/* Feed Sort Tabs */}
            <div className="border-b border-border/50">
              <FeedSortTabs 
                activeSort={feedSort} 
                onSortChange={setFeedSort}
                alertsCount={alertsCount}
              />
            </div>

            {/* Create Post */}
            <div className="border-b border-border/50 p-4">
              <div className="flex space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  variant="ghost" 
                  className="flex-1 justify-start text-muted-foreground h-12 text-lg rounded-lg border border-border/50"
                  onClick={() => setCreatePostModalOpen(true)}
                >
                  What's happening?
                </Button>
              </div>
            </div>

            {/* Posts Feed */}
            <div>
              {posts.map((post) => (
                <div key={post.id} className="border-b border-border/50 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {post.profiles?.first_name} {post.profiles?.last_name}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div 
                          className="cursor-pointer"
                           onClick={() => handlePostClick(post.id)}
                        >
                          <h3 className="font-medium text-foreground mb-1">{post.title}</h3>
                          <p className="text-foreground leading-relaxed">{post.content}</p>
                        </div>
                        
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="rounded-lg overflow-hidden border border-border/50">
                            <div className="aspect-video bg-muted"></div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between max-w-md pt-2">
                          <button 
                            onClick={handleLike}
                            className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                            <span className="text-sm">{post.upvotes || 0}</span>
                          </button>
                          
                          <button 
                            onClick={() => handlePostClick(post.id)}
                            className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-full"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm">{post.comment_count || 0}</span>
                          </button>
                          
                          <button 
                            onClick={() => setShareModalOpen(true)}
                            className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-colors p-2 hover:bg-green-50 rounded-full"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          
                          <button 
                            onClick={() => setIsSaved(!isSaved)}
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-full"
                          >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {posts.length === 0 && (
                <div className="p-12 text-center">
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
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block p-6 space-y-6">
            {/* Upcoming Events */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="space-y-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link to="/events">View All Events</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trending */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">What's happening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trending in your area</p>
                  <p className="font-medium">#LocalEvents</p>
                  <p className="text-xs text-muted-foreground">2,847 posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="font-medium">#IndianCommunity</p>
                  <p className="text-xs text-muted-foreground">1,234 posts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Food & Dining</p>
                  <p className="font-medium">#LocalRestaurants</p>
                  <p className="text-xs text-muted-foreground">956 posts</p>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace */}
            <Card className="border border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">For Sale Near You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketplaceItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm font-semibold text-primary">
                      {item.price ? `$${item.price}` : 'FREE'}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link to="/marketplace">View Marketplace</Link>
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

      {/* Post Detail Modal */}
      <PostDetailModal 
        postId={selectedPostId}
        open={postDetailModalOpen}
        onClose={handleClosePostModal}
      />
    </div>
  );
};

export default HomePage;