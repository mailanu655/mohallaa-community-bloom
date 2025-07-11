import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  AtSign, 
  Image as ImageIcon, 
  MapPin,
  ShoppingBag,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');

  const quickActions = [
    {
      icon: ShoppingBag,
      title: 'Sell or give away',
      subtitle: 'List items for sale or free',
      link: '/marketplace/create'
    },
    {
      icon: Calendar,
      title: 'Create an event',
      subtitle: 'Organize community events',
      link: '/events/create'
    },
    {
      icon: BarChart3,
      title: 'Poll your neighbors',
      subtitle: 'Get community opinions',
      link: '/posts/create?type=poll'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 bg-background border-0 shadow-2xl">
        <div className="flex">
          {/* Main Post Creation Area */}
          <div className="flex-1 p-6">
            <DialogHeader className="flex flex-row items-center justify-between p-0 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                Next
              </Button>
            </DialogHeader>

            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">
                  {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">Your Neighborhood</p>
              </div>
            </div>

            {/* Post Input */}
            <div className="mb-6">
              <Textarea
                placeholder="What's on your mind, neighbor?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[120px] border-0 p-0 text-base placeholder:text-muted-foreground resize-none focus-visible:ring-0 bg-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4 border-t border-border">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <AtSign className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="w-80 bg-muted/30 p-6 border-l border-border">
            <h3 className="font-semibold text-foreground mb-4">Create something</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/80 transition-colors group"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {action.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;