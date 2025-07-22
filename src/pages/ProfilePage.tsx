
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Home,
  ShoppingBag,
  Users,
  Settings,
  HelpCircle,
  UserPlus,
  Bookmark,
  Share2,
  MoreHorizontal,
  Edit,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import ConnectButton from "@/components/ConnectButton";
import CreatePostDialog from "@/components/CreatePostDialog";

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const isOwnProfile = user?.id === id;

  // Set up real-time subscription for profile updates
  useRealTimeSubscription({
    table: 'profiles',
    filter: `id=eq.${id}`,
    onUpdate: (payload) => {
      if (payload.new.id === id) {
        setProfile(prev => prev ? { ...prev, ...payload.new } : payload.new);
      }
    },
    onError: (error) => {
      console.error('Profile subscription error:', error);
    }
  });

  // Set up real-time subscription for posts updates
  useRealTimeSubscription({
    table: 'posts',
    filter: `author_id=eq.${id}`,
    onInsert: (payload) => {
      setPosts(prev => [payload.new, ...prev]);
    },
    onUpdate: (payload) => {
      setPosts(prev => prev.map(post => 
        post.id === payload.new.id ? { ...post, ...payload.new } : post
      ));
    },
    onDelete: (payload) => {
      setPosts(prev => prev.filter(post => post.id !== payload.old.id));
    },
    onError: (error) => {
      console.error('Posts subscription error:', error);
    }
  });

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile details first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      console.log('Profile fetch result:', { profileData, profileError });

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load profile data');
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch neighborhood data if selected_neighborhood_id exists
      if (profileData.selected_neighborhood_id) {
        const { data: neighborhoodData, error: neighborhoodError } = await supabase
          .from('neighborhoods')
          .select('name, city, state')
          .eq('id', profileData.selected_neighborhood_id)
          .maybeSingle();

        if (!neighborhoodError && neighborhoodData) {
          setNeighborhood(neighborhoodData);
        }
      }

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          communities(name),
          profiles(first_name, last_name, avatar_url)
        `)
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch communities user is member of
      const { data: userCommunities } = await supabase
        .from('community_members')
        .select(`
          communities(id, name, member_count, description)
        `)
        .eq('user_id', id)
        .limit(3);

      setPosts(postsData || []);
      setCommunities(userCommunities?.map(item => item.communities) || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-card/20 rounded-lg"></div>
            <div className="h-96 bg-card/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error === 'Profile not found' ? 'Profile Not Found' : 'Error Loading Profile'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {error === 'Profile not found' 
                ? "The profile you're looking for doesn't exist or has been removed."
                : error || "Something went wrong while loading the profile."
              }
            </p>
            <Button variant="default" asChild>
              <Link to="/communities">Browse Communities</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfileIncomplete = !profile.first_name || !profile.last_name || !profile.profession || !profile.selected_neighborhood_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header with Cover */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 rounded-t-lg relative">
              {isOwnProfile && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-white/80" asChild>
                    <Link to="/communities">
                      <Users className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/80" asChild>
                    <Link to="/profile/edit">
                      <Settings className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="bg-white border border-border/50 rounded-b-lg p-6 -mt-16 relative z-10">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24 border-4 border-white">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.first_name?.[0] || 'U'}{profile.last_name?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 mt-8">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.email?.split('@')[0] || 'User'
                    }
                  </h1>
                  
                  {neighborhood && (
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{neighborhood.name}, {neighborhood.city}, {neighborhood.state}</span>
                    </div>
                  )}

                  {profile.profession && (
                    <p className="text-sm text-muted-foreground mt-1">{profile.profession}</p>
                  )}

                  {isProfileIncomplete && isOwnProfile && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Your profile is incomplete. Complete it to get the most out of Mohallaa.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 mt-4">
                    {isOwnProfile ? (
                      <>
                        <Button variant="outline" asChild>
                          <Link to={isProfileIncomplete ? "/profile/complete" : "/profile/edit"}>
                            <Edit className="w-4 h-4 mr-2" />
                            {isProfileIncomplete ? "Complete profile" : "Edit profile"}
                          </Link>
                        </Button>
                        <Button variant="ghost">Switch accounts</Button>
                      </>
                    ) : (
                      <ConnectButton userId={id || ''} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Section - only for own profile */}
          {isOwnProfile && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
                <span className="text-sm text-muted-foreground">Only visible to you</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/bookmarks">
                  <Card className="border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Bookmarks</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/events">
                  <Card className="border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Events</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link to="/profile/edit">
                  <Card className="border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium">Interests</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          )}

          {/* Groups Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Groups</h2>
              <Button variant="ghost" className="text-sm text-primary" asChild>
                <Link to="/communities">See all</Link>
              </Button>
            </div>
            
            <div className="space-y-3">
              {communities.map((community, index) => (
                <Link key={index} to={`/communities/${community.id}`}>
                  <Card className="border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {community.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{community.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {community.member_count} members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              
              {communities.length === 0 && (
                <Card className="border border-border/50">
                  <CardContent className="p-6 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Not a member of any groups yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Posts</h2>
            
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                          {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-foreground">
                            {post.profiles?.first_name} {post.profiles?.last_name}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                          <Badge className="text-xs">{post.post_type}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-foreground mb-1">{post.title}</h3>
                            <p className="text-foreground">{post.content}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors">
                                <Heart className="w-5 h-5" />
                                <span className="text-sm">{post.upvotes || 0}</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                                <span className="text-sm">{post.comment_count || 0}</span>
                              </button>
                              
                              <button className="flex items-center space-x-2 text-muted-foreground hover:text-green-500 transition-colors">
                                <Share2 className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {posts.length === 0 && (
                <Card className="border border-border/50">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile ? "You haven't shared any posts yet." : "This user hasn't shared any posts yet."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      <CreatePostDialog 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
      />
    </div>
  );
};

export default ProfilePage;
