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
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePostModalProps {
  post: any;
  open: boolean;
  onClose: () => void;
}

const SharePostModal = ({ post, open, onClose }: SharePostModalProps) => {
  const { toast } = useToast();

  const handleShare = async (method: string) => {
    if (!post) return;
    
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareTitle = post.title || 'Check out this post';
    const shareText = `${shareTitle}\n\n${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

    switch (method) {
      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank');
        break;
        
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        break;
        
      case 'twitter':
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(tweetUrl, '_blank');
        break;
        
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied!",
            description: "Post link has been copied to your clipboard.",
          });
        } catch (error) {
          console.error('Failed to copy:', error);
          toast({
            title: "Copy failed",
            description: "Please try again or use manual copy.",
            variant: "destructive",
          });
        }
        break;
        
      case 'email':
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.location.href = emailUrl;
        break;
        
      case 'chat':
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareText,
              url: shareUrl,
            });
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Share failed:', error);
            }
          }
        }
        break;
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-background rounded-2xl">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Share this post</DialogTitle>
            <DialogClose className="w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 flex items-center justify-center transition-colors">
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
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center space-y-2 p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">X</span>
            </button>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('chat')}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-medium text-center">Chat</span>
            </button>

            <button
              onClick={() => handleShare('copy')}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <Copy className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-medium text-center">Copy link</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <Mail className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-medium text-center">Email</span>
            </button>

            <button
              onClick={() => handleShare('repost')}
              className="flex flex-col items-center space-y-2 p-3 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <Repeat2 className="w-6 h-6 text-muted-foreground" />
              <span className="text-xs font-medium text-center">Repost</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;