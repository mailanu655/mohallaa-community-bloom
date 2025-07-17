import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X,
  Heart,
  MessageSquare,
  Copy,
  Mail,
  Users,
  Repeat2,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  title: string;
  content: string;
  upvotes?: number | null;
  comment_count?: number | null;
  author_id?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface SharePostModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
}

const SharePostModal = ({ post, open, onClose }: SharePostModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleShare = async (method: string) => {
    if (!post) return;
    
    setLoading(method);
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareTitle = post.title || 'Check out this post';
    const shareText = `${shareTitle}\n\n${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

    try {
      switch (method) {
        case 'facebook':
          // Updated Facebook sharing URL format
          const facebookShareUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}&t=${encodeURIComponent(shareTitle)}`;
          
          // Try to open popup window
          const facebookWindow = window.open(
            facebookShareUrl, 
            'facebook-share',
            'width=626,height=436,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,status=no,directories=no,location=no'
          );
          
          if (!facebookWindow || facebookWindow.closed || typeof facebookWindow.closed == 'undefined') {
            // Fallback: try direct navigation if popup is blocked
            window.open(facebookShareUrl, '_blank');
          }
          
          toast({
            title: "Opening Facebook Share",
            description: "Facebook share dialog is opening in a new window.",
          });
          break;
          
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          const whatsappWindow = window.open(whatsappUrl, '_blank');
          if (!whatsappWindow) {
            throw new Error('Popup blocked');
          }
          toast({
            title: "Shared to WhatsApp!",
            description: "Post opened in new tab.",
          });
          break;
          
        case 'twitter':
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          const twitterWindow = window.open(tweetUrl, '_blank');
          if (!twitterWindow) {
            throw new Error('Popup blocked');
          }
          toast({
            title: "Shared to X!",
            description: "Post opened in new tab.",
          });
          break;
          
        case 'copy':
          if (!navigator.clipboard) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          } else {
            await navigator.clipboard.writeText(shareUrl);
          }
          toast({
            title: "Link copied!",
            description: "Post link has been copied to your clipboard.",
          });
          break;
          
        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
          window.location.href = emailUrl;
          toast({
            title: "Email app opened!",
            description: "Compose email with post details.",
          });
          break;
          
        case 'chat':
          if (navigator.share) {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
            });
            toast({
              title: "Shared successfully!",
              description: "Post shared via native share.",
            });
          } else {
            toast({
              title: "Share not supported",
              description: "Native sharing is not available on this device.",
              variant: "destructive",
            });
          }
          break;
          
        case 'repost':
          // Get current user from auth
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Cannot repost",
              description: "You must be logged in to repost.",
              variant: "destructive",
            });
            return;
          }
          
          // Create a repost - insert new post referencing original
          const { error } = await supabase.from('posts').insert({
            author_id: user.id,
            title: `Repost: ${post.title}`,
            content: `Shared from original post:\n\n"${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}"\n\nOriginal post: ${shareUrl}`,
            post_type: 'discussion'
          });
          
          if (error) {
            throw error;
          }
          
          toast({
            title: "Reposted successfully!",
            description: "The post has been shared to your feed.",
          });
          onClose();
          break;
          
        default:
          throw new Error(`Unknown share method: ${method}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Special handling for Facebook sharing errors
      if (method === 'facebook') {
        toast({
          title: "Facebook sharing issue",
          description: "Try copying the link and sharing it manually on Facebook.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Share failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-background rounded-2xl">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Share this post</DialogTitle>
            <DialogClose className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center transition-colors">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Post Preview */}
          <div className="bg-muted/10 rounded-xl p-4 mb-6">
            <p className="text-foreground leading-relaxed mb-3">
              {post.content}
            </p>
            
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {post.profiles?.first_name} {post.profiles?.last_name}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{post.upvotes || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">{post.comment_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Social Media Options */}
          <div className="flex justify-center space-x-6 mb-6">
            <button
              onClick={() => handleShare('facebook')}
              disabled={loading === 'facebook'}
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Share to Facebook"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                {loading === 'facebook' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              disabled={loading === 'whatsapp'}
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Share to WhatsApp"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                {loading === 'whatsapp' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              disabled={loading === 'twitter'}
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Share to X (Twitter)"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                {loading === 'twitter' ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">X</span>
            </button>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('chat')}
              disabled={loading === 'chat'}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Share via chat"
            >
              {loading === 'chat' ? (
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              ) : (
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-center">
                {navigator.share ? 'Chat' : 'Chat (unavailable)'}
              </span>
            </button>

            <button
              onClick={() => handleShare('copy')}
              disabled={loading === 'copy'}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Copy link to clipboard"
            >
              {loading === 'copy' ? (
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              ) : (
                <Copy className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-center">Copy link</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              disabled={loading === 'email'}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Share via email"
            >
              {loading === 'email' ? (
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              ) : (
                <Mail className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-center">Email</span>
            </button>

            <button
              onClick={() => handleShare('repost')}
              disabled={loading === 'repost'}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Repost to your feed"
            >
              {loading === 'repost' ? (
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              ) : (
                <Repeat2 className="w-6 h-6 text-muted-foreground" />
              )}
              <span className="text-xs font-medium text-center">Repost</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;
