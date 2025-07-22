import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  MapPin,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import CreatePostDialog from '@/components/CreatePostDialog';
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
import { NeighborhoodLocationPrompt } from '@/components/NeighborhoodLocationPrompt';
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
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
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
  const { 
    location, 
    loading: locationLoading, 
    selectedNeighborhood,
    setNeighborhoodLocation
  } = useLocation();
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

  // No location confirmation dialog needed anymore

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

  const handlePostCreated = () => {
    // Refresh the feed when a new post is created
    fetchFeedData(1, true);
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
    <div>
      {/* Show neighborhood selection prompt if no neighborhood selected */}
      {!selectedNeighborhood && (
        <div className="max-w-md mx-auto p-4">
          <NeighborhoodLocationPrompt />
        </div>
      )}

      {selectedNeighborhood && (
        <>
          <div className="lg:col-span-2 border-r border-border/50">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-foreground">Home</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedNeighborhood.name}, {selectedNeighborhood.city}
                </p>
              </div>
            </div>

            {/* Feed Sort Tabs */}
            <div className="border-b border-border/50">
              <FeedSortTabs 
                activeSort={feedSort} 
                onSortChange={(sort) => {
                  setFeedSort(sort);
                }}
                alertsCount={getActiveAlertsCount()}
                onAlertsClick={() => setSafetyAlertsModalOpen(true)}
                location={{
                  city: selectedNeighborhood.city,
                  state: selectedNeighborhood.state,
                  neighborhood: selectedNeighborhood.name
                }}
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
                  onClick={() => setCreatePostDialogOpen(true)}
                >
                  What's happening?
                </Button>
              </div>
            </div>

            {/* Location prompts are now handled by neighborhood selection */}

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
                      onClick={() => setCreatePostDialogOpen(true)}
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
          <div className="hidden lg:block lg:col-span-1 p-6 space-y-6">
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
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : trending.length > 0 ? (
                  trending.map((topic) => (
                    <div key={topic.category} className="space-y-1">
                      <h4 className="font-medium text-sm">{topic.label}</h4>
                      <div className="text-xs text-muted-foreground">
                        {topic.count} posts
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No trending topics yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Modals */}
      <CreatePostDialog 
        isOpen={createPostDialogOpen} 
        onClose={() => setCreatePostDialogOpen(false)}
        communityId="general"
        onPostCreated={handlePostCreated}
      />
      
      <PostDetailModal
        postId={selectedPostId}
        open={postDetailModalOpen}
        onClose={handleClosePostModal}
      />

      <SafetyAlertsModal
        open={safetyAlertsModalOpen}
        onOpenChange={setSafetyAlertsModalOpen}
      />

      {/* Dialogs are now handled by the neighborhood selection system */}
    </div>
  );
};

export default HomePage;
