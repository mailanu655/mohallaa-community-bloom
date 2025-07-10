import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Users, TrendingUp, MessageSquare, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProfileCompletionWidget from "@/components/ProfileCompletionWidget";

const Dashboard = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch communities
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('*')
        .limit(6);

      // Fetch recent posts with author info
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          communities(name),
          profiles!inner(first_name, last_name)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4);

      setCommunities(communitiesData || []);
      setRecentPosts(postsData || []);
      setUpcomingEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-card/20 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-card/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20 md:pb-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to Your{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Community Hub
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay connected with your local Indian communities, discover events, and engage in meaningful discussions.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="hover:shadow-cultural transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{communities.length}</div>
              <div className="text-sm text-muted-foreground">Communities</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-cultural transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{recentPosts.length}</div>
              <div className="text-sm text-muted-foreground">Recent Posts</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-cultural transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <CalendarDays className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-cultural transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion Widget */}
            <ProfileCompletionWidget />
            
            {/* Your Communities */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">Your Communities</span>
                  <Button variant="cultural" size="sm" asChild>
                    <Link to="/communities">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.slice(0, 4).map((community) => (
                    <Card key={community.id} className="hover:shadow-cultural transition-all duration-300 hover:-translate-y-1 border-0 bg-background/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-foreground line-clamp-2">{community.name}</h3>
                            <Badge variant="secondary" className="ml-2">
                              {community.type}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            {community.city}, {community.state}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {community.member_count || 0} members
                            </span>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/community/${community.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">Recent Discussions</span>
                  <Button variant="cultural" size="sm" asChild>
                    <Link to="/posts">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground hover:text-primary transition-colors">
                          <Link to={`/post/${post.id}`} className="story-link">
                            {post.title}
                          </Link>
                        </h4>
                        <Badge variant={post.post_type === 'announcement' ? 'default' : 'secondary'}>
                          {post.post_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={post.profiles?.avatar_url} />
                            <AvatarFallback>
                              {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </span>
                          {post.communities && (
                            <>
                              <span>•</span>
                              <span>{post.communities.name}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {post.upvotes || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {post.comment_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                      <div key={event.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">{event.title}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <CalendarDays className="w-4 h-4 mr-2" />
                              {new Date(event.start_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {event.location}
                            </div>
                            {event.communities && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                {event.communities.name}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant={event.is_free ? 'secondary' : 'outline'}>
                              {event.is_free ? 'Free' : `$${event.ticket_price}`}
                            </Badge>
                             <Button variant="outline" size="sm">
                               Learn More
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   {upcomingEvents.length === 0 && (
                     <p className="text-muted-foreground">No upcoming events</p>
                   )}
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
       </div>
     );
   };

   export default Dashboard;