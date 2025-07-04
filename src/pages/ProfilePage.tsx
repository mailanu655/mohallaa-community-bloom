import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Mail, Calendar, Heart, MessageSquare, ExternalLink, Globe, Briefcase, GraduationCap, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
          communities(name, city, state)
        `)
        .eq('id', id)
        .single();

      // Fetch user's posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          communities(name)
        `)
        .eq('author_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      setProfile(profileData);
      setPosts(postsData || []);
      setCommunity(profileData?.communities);
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
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    {profile.is_verified && (
                      <Badge variant="default">Verified</Badge>
                    )}
                  </div>
                  {profile.profession && (
                    <p className="text-lg text-muted-foreground flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {profile.profession}
                    </p>
                  )}
                  {profile.experience_years && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {profile.experience_years} years experience
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Contact and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {community && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{community.city}, {community.state}</span>
                      </div>
                    )}
                    {profile.hometown_india && (
                      <div className="flex items-center text-muted-foreground">
                        <Globe className="w-4 h-4 mr-2" />
                        <span className="text-sm">From {profile.hometown_india}, India</span>
                      </div>
                    )}
                    {profile.linkedin_url && (
                      <div className="flex items-center text-muted-foreground">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <a 
                          href={profile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm hover:text-primary transition-colors story-link"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {profile.languages && profile.languages.length > 0 && (
                      <div className="flex items-start">
                        <Languages className="w-4 h-4 mr-2 mt-1" />
                        <div className="flex flex-wrap gap-1">
                          {profile.languages.map((language, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {community && (
                      <div className="flex items-center text-muted-foreground">
                        <span className="text-sm">Member of </span>
                        <Link 
                          to={`/community/${profile.community_id}`}
                          className="text-sm text-primary hover:underline ml-1 story-link"
                        >
                          {community.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="hero">Connect</Button>
                  <Button variant="outline">Send Message</Button>
                  <Button variant="cultural">Follow</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Skills & Interests Tab */}
          <TabsContent value="skills" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <Card className="border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="default" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <Card className="border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {(!profile.skills || profile.skills.length === 0) && (!profile.interests || profile.interests.length === 0) && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No skills or interests listed</h3>
                  <p className="text-muted-foreground">
                    This user hasn't added their skills and interests yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Recent Posts</h2>
              <p className="text-muted-foreground">{posts.length} posts</p>
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
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          {post.communities && (
                            <span>in {post.communities.name}</span>
                          )}
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
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
                  <p className="text-muted-foreground">
                    This user hasn't shared any posts yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 animate-fade-in">
            <Card className="border-0 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Activity Feed</h3>
                <p className="text-muted-foreground">
                  Activity feed coming soon! This will show user engagement and interactions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;