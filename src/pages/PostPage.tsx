import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageSquare, Share, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPostData();
    }
  }, [id]);

  const fetchPostData = async () => {
    try {
      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url),
          communities(name)
        `)
        .eq('id', id)
        .single();

      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      setPost(postData);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-card/20 rounded-lg"></div>
            <div className="h-48 bg-card/20 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h2>
            <p className="text-muted-foreground mb-6">This post doesn't exist or has been removed.</p>
            <Button variant="cultural" asChild>
              <Link to="/posts">Browse Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Post Content */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant={post.post_type === 'announcement' ? 'default' : 'secondary'}>
                  {post.post_type}
                </Badge>
                {post.is_pinned && <Badge variant="outline">Pinned</Badge>}
                {post.communities && <Badge variant="outline">{post.communities.name}</Badge>}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{post.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={`/profile/${post.author_id}`} className="font-medium text-foreground hover:text-primary story-link">
                      {post.profiles?.first_name} {post.profiles?.last_name}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.upvotes || 0}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              Comments ({comments.length})
            </h2>
            
            {/* Add Comment */}
            <div className="space-y-4">
              <Textarea placeholder="Share your thoughts..." rows={3} />
              <Button variant="cultural">Post Comment</Button>
            </div>
            
            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-primary/20 pl-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.profiles?.avatar_url} />
                        <AvatarFallback>
                          {comment.profiles?.first_name?.[0]}{comment.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${comment.author_id}`} className="font-medium text-foreground hover:text-primary story-link">
                          {comment.profiles?.first_name} {comment.profiles?.last_name}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      {comment.upvotes || 0}
                    </Button>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
            
            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No comments yet</h3>
                <p className="text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostPage;