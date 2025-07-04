import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Calendar, MessageSquare, Heart, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CommunityPage = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  const fetchCommunityData = async () => {
    try {
      // Fetch community details
      const { data: communityData } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      // Fetch community posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url)
        `)
        .eq('community_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch community events
      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .eq('community_id', id)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(10);

      // Fetch community members (profiles associated with this community)
      const { data: membersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('community_id', id)
        .limit(20);

      setCommunity(communityData);
      setPosts(postsData || []);
      setEvents(eventsData || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-card/20 rounded-lg"></div>
            <div className="h-96 bg-card/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Community Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The community you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="cultural" asChild>
              <Link to="/communities">Browse Communities</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Community Header */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                        {community.name}
                      </h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {community.city}, {community.state}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {community.member_count || 0} members
                        </div>
                        <Badge variant="secondary">{community.type}</Badge>
                      </div>
                    </div>
                  </div>
                  {community.description && (
                    <p className="text-muted-foreground max-w-3xl">
                      {community.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="hero" size="lg">
                    Join Community
                  </Button>
                  <Button variant="outline" size="lg">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Content */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="posts">Posts & Discussions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Community Discussions</h2>
              <Button variant="cultural">New Post</Button>
            </div>
            
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={post.post_type === 'announcement' ? 'default' : 'secondary'}>
                              {post.post_type}
                            </Badge>
                            {post.is_pinned && (
                              <Badge variant="outline">Pinned</Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            <Link to={`/post/${post.id}`} className="story-link">
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={post.profiles?.avatar_url} />
                              <AvatarFallback>
                                {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {post.profiles?.first_name} {post.profiles?.last_name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center hover-scale cursor-pointer">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.upvotes || 0}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comment_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {posts.length === 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to start a discussion in this community!
                  </p>
                  <Button variant="cultural">Create First Post</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
              <Button variant="cultural">Create Event</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Badge variant="outline">{event.event_type}</Badge>
                        <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.start_date).toLocaleDateString()} at{" "}
                          {new Date(event.start_date).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {event.current_attendees || 0} attending
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </div>
                        {!event.is_free && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            ${event.ticket_price}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={event.is_free ? 'secondary' : 'outline'}>
                          {event.is_free ? 'Free Event' : 'Paid Event'}
                        </Badge>
                        <Button variant="cultural" size="sm">
                          Join Event
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {events.length === 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-6">
                    No events are scheduled for this community yet.
                  </p>
                  <Button variant="cultural">Create Event</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Community Members</h2>
              <Button variant="outline">Invite Members</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground">
                            {member.first_name} {member.last_name}
                          </h3>
                          {member.profession && (
                            <p className="text-sm text-muted-foreground">{member.profession}</p>
                          )}
                          {member.is_verified && (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </div>
                      
                      {member.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                      
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={`/profile/${member.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {members.length === 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No members found</h3>
                  <p className="text-muted-foreground mb-6">
                    This community is just getting started.
                  </p>
                  <Button variant="cultural">Invite Friends</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityPage;