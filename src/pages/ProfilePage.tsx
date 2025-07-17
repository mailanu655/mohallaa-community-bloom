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
  Edit
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeSubscription } from "@/hooks/useRealTimeSubscription";
import ConnectButton from "@/components/ConnectButton";
import CreatePostModal from "@/components/CreatePostModal";

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Fetch profile details
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          communities(name, city, state)
        `)
        .eq('id', id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfile(null);
        setLoading(false);
        return;
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

      setProfile(profileData);
      setPosts(postsData || []);
      setCommunity(profileData?.communities);
      setCommunities(userCommunities?.map(item => item.communities) || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-5xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-card/20 rounded-lg"></div>
            <div className="h-96 bg-card/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The profile you're looking for doesn't exist or has been removed.
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 min-h-screen">
          {/* Left Sidebar */}
          <div className="hidden lg:block border-r border-border/50 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Mohallaa</h2>
              
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/home">
                    <Home className="w-5 h-5 mr-3" />
                    Home
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/marketplace">
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    For Sale & Free
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Heart className="w-5 h-5 mr-3" />
                  Faves
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/communities">
                    <Users className="w-5 h-5 mr-3" />
                    Groups
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/events">
                    <Calendar className="w-5 h-5 mr-3" />
                    Events
                  </Link>
                </Button>
              </nav>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowCreatePost(true)}
              >
                Post
              </Button>
            </div>

            <div className="space-y-2 pt-6 border-t border-border/50">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/profile/edit">
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="w-5 h-5 mr-3" />
                Help Center
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <UserPlus className="w-5 h-5 mr-3" />
                Invite neighbors
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 p-6 space-y-6">
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
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 mt-8">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {community && (
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{community.city}</span>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-4">
                      {isOwnProfile ? (
                        <>
                          <Button variant="outline" asChild>
                            <Link to="/profile/edit">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit profile
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

            {/* Dashboard Section */}
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
      </div>
      
      {/* Create Post Modal */}
      <CreatePostModal 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost} 
      />
    </div>
  );
};

export default ProfilePage;