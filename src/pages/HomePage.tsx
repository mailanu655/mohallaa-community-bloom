import { useState, useEffect, useCallback } from 'react';
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
  Bookmark,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostModal from '@/components/CreatePostModal';
import FeedSortTabs from '@/components/FeedSortTabs';
import TwitterLikePostCard from '@/components/TwitterLikePostCard';
import PostDetailModal from '@/components/PostDetailModal';
import SafetyAlertsModal from '@/components/SafetyAlertsModal';
import { useSafetyAlerts } from '@/hooks/useSafetyAlerts';
import { useRealTimeSafetyAlerts } from '@/hooks/useRealTimeSafetyAlerts';
import { useTrending } from '@/hooks/useTrending';
import { usePersonalizedFeed } from '@/hooks/usePersonalizedFeed';
import { useUserInteractions } from '@/hooks/useUserInteractions';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyPosts } from '@/hooks/useNearbyPosts';
import { requestService } from '@/utils/requestService';
import { PostLikeButton } from '@/components/PostLikeButton';
import { PostBookmarkButton } from '@/components/PostBookmarkButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';
import PostMediaGallery from '@/components/PostMediaGallery';

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [feedSort, setFeedSort] = useState('for-you');
  const [loading, setLoading] = useState(true);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [safetyAlertsModalOpen, setSafetyAlertsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postDetailModalOpen, setPostDetailModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allPosts, setAllPosts] = useState([]);

  // Safety alerts hooks
  const { getActiveAlertsCount } = useSafetyAlerts();
  useRealTimeSafetyAlerts();
  
  // Trending topics hook
  const { trending, loading: trendingLoading } = useTrending();
  
  // Personalized feed hook
  const { 
    posts: personalizedPosts, 
    loading: personalizedLoading, 
    error: personalizedError,
    refreshFeed 
  } = usePersonalizedFeed();
  
  // User interactions hook
  const { 
    trackView, 
    trackLike, 
    trackComment, 
    trackShare, 
    trackBookmark 
  } = useUserInteractions();

  // Location and nearby posts hooks
  const { location, loading: locationLoading, requestLocation, permissionStatus } = useLocation();
  const { posts: nearbyPosts, loading: nearbyLoading } = useNearbyPosts(location);

  // Real-time subscription for posts
  useRealTimeSubscription({
    table: 'posts',
    onInsert: (payload) => {
      const newPost = payload.new;
      if (newPost) {
        setAllPosts(prev => [newPost, ...prev]);
        setPosts(prev => [newPost, ...prev]);
      }
    },
    onUpdate: (payload) => {
      const updatedPost = payload.new;
      if (updatedPost) {
        setAllPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
        setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
      }
    },
    onDelete: (payload) => {
      const deletedPost = payload.old;
      if (deletedPost) {
        setAllPosts(prev => prev.filter(post => post.id !== deletedPost.id));
        setPosts(prev => prev.filter(post => post.id !== deletedPost.id));
      }
    }
  });

  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFeedData(nextPage, false);
  }, [hasMore, loading, page, feedSort]);

  const { isFetching } = useInfiniteScroll(fetchMore);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    
    if (feedSort === 'for-you') {
      // For personalized feed, use the personalized posts
      setLoading(personalizedLoading);
      if (!personalizedLoading) {
        setPosts(personalizedPosts);
        setAllPosts(personalizedPosts);
      }
    } else if (feedSort === 'nearby') {
      // For nearby feed, use the nearby posts
      setLoading(nearbyLoading);
      if (!nearbyLoading) {
        setPosts(nearbyPosts);
        setAllPosts(nearbyPosts);
      }
    } else {
      // For other feed types, fetch data normally
      fetchFeedData(1, true);
    }
  }, [feedSort, personalizedPosts, personalizedLoading, nearbyPosts, nearbyLoading]);

  const fetchFeedData = async (pageNum = 1, reset = false) => {
    try {
      // Use the new request service for all API calls
      const [postsData, eventsData, marketplaceData, businessData] = await Promise.all([
        requestService.getPosts(pageNum, 15, feedSort),
        requestService.getEvents(5),
        requestService.getMarketplaceItems(6),
        requestService.getBusinesses(5)
      ]);

      const newPosts = postsData || [];
      setHasMore(newPosts.length === 15);
      
      if (reset || pageNum === 1) {
        setPosts(newPosts);
        setAllPosts(newPosts);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setAllPosts(prev => [...prev, ...newPosts]);
      }
      
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
    // Track post view
    trackView(postId);
    setSelectedPostId(postId);
    setPostDetailModalOpen(true);
  };

  const handleClosePostModal = () => {
    setPostDetailModalOpen(false);
    setSelectedPostId(null);
  };

  const handleCommentClick = (postId: string) => {
    // Track comment interaction
    trackComment(postId);
    handlePostClick(postId);
  };

  const handleShareClick = (postId: string) => {
    // Track share interaction
    trackShare(postId);
    setShareModalOpen(true);
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
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/bookmarks">
                    <Bookmark className="w-5 h-5 mr-3" />
                    Bookmarks
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
                onSortChange={(sort) => {
                  setFeedSort(sort);
                  if (sort === 'nearby' && !location && permissionStatus === 'prompt') {
                    requestLocation();
                  }
                }}
                alertsCount={getActiveAlertsCount()}
                onAlertsClick={() => setSafetyAlertsModalOpen(true)}
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

            {/* Location Permission Prompt for Nearby */}
            {feedSort === 'nearby' && permissionStatus === 'prompt' && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 m-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">Enable Location Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow location access to see posts from your area
                    </p>
                  </div>
                  <Button 
                    onClick={requestLocation} 
                    disabled={locationLoading}
                    size="sm"
                  >
                    {locationLoading ? 'Getting Location...' : 'Allow Location'}
                  </Button>
                </div>
              </div>
            )}

            {/* Location Denied Message */}
            {feedSort === 'nearby' && permissionStatus === 'denied' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 m-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-800">Location Access Denied</h3>
                    <p className="text-sm text-amber-700">
                      To see nearby posts, please enable location access in your browser settings or try again.
                    </p>
                  </div>
                  <Button 
                    onClick={requestLocation} 
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div>
              {posts.map((post) => (
                <TwitterLikePostCard
                  key={post.id}
                  post={post}
                  onPostClick={handlePostClick}
                  onCommentClick={handleCommentClick}
                  onShareClick={handleShareClick}
                />
              ))}

              {posts.length === 0 && !loading && (
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

              {/* Loading indicator for infinite scroll */}
              {isFetching && (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading more posts...</p>
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
                {trendingLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : trending.length > 0 ? (
                  trending.map((topic, index) => (
                    <div key={topic.hashtag} className="space-y-1">
                      <p className="text-sm text-muted-foreground">{topic.category}</p>
                      <p className="font-medium">{topic.hashtag}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.count} {topic.count === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No trending topics yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start posting with hashtags to see what's trending!
                    </p>
                  </div>
                )}
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

      {/* Safety Alerts Modal */}
      <SafetyAlertsModal 
        open={safetyAlertsModalOpen}
        onOpenChange={setSafetyAlertsModalOpen}
      />
    </div>
  );
};

export default HomePage;