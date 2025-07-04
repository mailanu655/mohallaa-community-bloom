import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Heart, Search, Filter, Plus, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, searchTerm, selectedCommunity, selectedType, sortBy]);

  const fetchData = async () => {
    try {
      // Fetch posts with author and community info
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name)
        `)
        .order('created_at', { ascending: false });

      // Fetch communities for filter
      const { data: communitiesData } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');

      setPosts(postsData || []);
      setCommunities(communitiesData || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = posts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply community filter
    if (selectedCommunity) {
      filtered = filtered.filter(post => post.community_id === selectedCommunity);
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(post => post.post_type === selectedType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'discussed':
        filtered.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredPosts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-card/20 rounded w-64"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-card/20 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Community{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Discussions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join the conversation, share your thoughts, and connect with the Indian diaspora community.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Communities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Communities</SelectItem>
                  {communities.map(community => (
                    <SelectItem key={community.id} value={community.id}>{community.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Post Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Recent
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Popular
                    </div>
                  </SelectItem>
                  <SelectItem value="discussed">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Most Discussed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Button */}
            <div className="flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {filteredPosts.length} Posts
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCommunity("");
                    setSelectedType("");
                    setSortBy("recent");
                  }}
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero" className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 p-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Post Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select post type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discussion">Discussion</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Community</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map(community => (
                            <SelectItem key={community.id} value={community.id}>
                              {community.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input placeholder="Enter post title..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        placeholder="What would you like to share with the community?"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags (optional)</label>
                      <Input placeholder="Add tags separated by commas..." />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="cultural">Create Post</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Posts List */}
            <div className="space-y-6 animate-fade-in">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={post.post_type === 'announcement' ? 'default' : 'secondary'}>
                              {post.post_type}
                            </Badge>
                            {post.is_pinned && (
                              <Badge variant="outline">Pinned</Badge>
                            )}
                            {post.communities && (
                              <Badge variant="outline">{post.communities.name}</Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            <Link to={`/post/${post.id}`} className="story-link">
                              {post.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                            {post.content}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={post.profiles?.avatar_url} />
                              <AvatarFallback>
                                {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <Link 
                                to={`/profile/${post.author_id}`}
                                className="font-medium text-foreground hover:text-primary transition-colors story-link"
                              >
                                {post.profiles?.first_name} {post.profiles?.last_name}
                              </Link>
                              <div className="text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{post.upvotes || 0}</span>
                          </button>
                          <Link 
                            to={`/post/${post.id}`}
                            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">{post.comment_count || 0}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <Card className="border-0 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">No posts found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria or create the first post.
                      </p>
                    </div>
                    <Button variant="cultural">Create First Post</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Communities */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communities.slice(0, 5).map(community => (
                  <div key={community.id} className="flex items-center justify-between">
                    <Link 
                      to={`/community/${community.id}`}
                      className="text-sm text-foreground hover:text-primary transition-colors story-link"
                    >
                      {community.name}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {posts.filter(p => p.community_id === community.id).length}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['community', 'networking', 'career', 'culture', 'food', 'events', 'advice', 'help'].map(tag => (
                    <Badge 
                      key={tag}
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSearchTerm(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-semibold text-foreground">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Communities</span>
                  <span className="font-semibold text-foreground">{communities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Posts</span>
                  <span className="font-semibold text-foreground">
                    {posts.filter(p => 
                      new Date(p.created_at).toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;