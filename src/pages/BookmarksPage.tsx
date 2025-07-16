import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PostBookmarkButton } from '@/components/PostBookmarkButton';
import { PostLikeButton } from '@/components/PostLikeButton';
import { Button } from '@/components/ui/button';

interface BookmarkedPost {
  id: string;
  created_at: string;
  posts: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    upvotes: number;
    comment_count: number;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
    communities: {
      name: string;
      city: string;
      state: string;
    } | null;
  };
}

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchBookmarkedPosts();
  }, [user]);

  const fetchBookmarkedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('post_bookmarks')
        .select(`
          id,
          created_at,
          posts!inner(
            id,
            title,
            content,
            created_at,
            upvotes,
            comment_count,
            profiles!inner(first_name, last_name, avatar_url),
            communities(name, city, state)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarkedPosts(data || []);
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Please log in to view your bookmarks</h2>
            <Button asChild>
              <Link to="/auth">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border/50 p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/home">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Bookmarks</h1>
            </div>
          </div>
        </div>

        {/* Bookmarked Posts */}
        <div className="p-4">
          {bookmarkedPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                    <Bookmark className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">No bookmarks yet</h3>
                    <p className="text-muted-foreground">
                      Save posts to read them later. They'll appear here.
                    </p>
                  </div>
                  <Button variant="default" asChild>
                    <Link to="/home">Explore Posts</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookmarkedPosts.map((bookmark) => (
                <Card key={bookmark.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={bookmark.posts.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {bookmark.posts.profiles?.first_name?.[0]}{bookmark.posts.profiles?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-foreground">
                            {bookmark.posts.profiles?.first_name} {bookmark.posts.profiles?.last_name}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(new Date(bookmark.posts.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-foreground mb-1">{bookmark.posts.title}</h3>
                            <p className="text-foreground leading-relaxed">{bookmark.posts.content}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 pt-2">
                            <PostLikeButton postId={bookmark.posts.id} />
                            <PostBookmarkButton postId={bookmark.posts.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;