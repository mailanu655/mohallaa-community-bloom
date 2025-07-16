import { useState, useEffect } from 'react';
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
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedCreatePostForm from './EnhancedCreatePostForm';
import FileUploader from './FileUploader';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostModal = ({ open, onOpenChange }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [currentStep, setCurrentStep] = useState<'initial' | 'enhanced'>('initial');
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCommunities();
    }
  }, [open]);

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const handleNext = () => {
    if (postContent.trim()) {
      setCurrentStep('enhanced');
    }
  };

  const handleBack = () => {
    setCurrentStep('initial');
  };

  const handlePostCreated = () => {
    setCurrentStep('initial');
    setPostContent('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setCurrentStep('initial');
    setPostContent('');
    onOpenChange(false);
  };

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + text + value.substring(end);
      setPostContent(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const handleMention = () => {
    insertAtCursor('@');
  };

  const handleLocation = () => {
    // For now, just insert a location placeholder
    insertAtCursor('📍 ');
  };

  const handleImageUpload = (fileInfo: any) => {
    // Insert image reference in the textarea
    insertAtCursor(`[Image: ${fileInfo.name}] `);
    setShowFileUploader(false);
  };

  const quickActions = [
    {
      icon: ShoppingBag,
      title: 'Share & Exchange',
      subtitle: 'List Indian goods, share recipes, or exchange items',
      link: '/marketplace/create'
    },
    {
      icon: Calendar,
      title: 'Cultural Events',
      subtitle: 'Organize festivals, meetups, and celebrations',
      link: '/events/create'
    },
    {
      icon: BarChart3,
      title: 'Community Voice',
      subtitle: 'Ask for local recommendations and advice',
      link: '/posts/create?type=question'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 bg-background border-0 shadow-2xl">
        {currentStep === 'initial' ? (
          <div className="flex">
            {/* Main Post Creation Area */}
            <div className="flex-1 p-6">
              <DialogHeader className="flex flex-row items-center justify-between p-0 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleNext}
                  disabled={!postContent.trim()}
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
                  placeholder="Share with your local Indian community..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[120px] border-0 p-0 text-base placeholder:text-muted-foreground resize-none focus-visible:ring-0 bg-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMention}
                  className="text-muted-foreground hover:text-foreground"
                  title="Add mention"
                >
                  <AtSign className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFileUploader(!showFileUploader)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Add image"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLocation}
                  className="text-muted-foreground hover:text-foreground"
                  title="Add location"
                >
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>

              {/* File Uploader */}
              {showFileUploader && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
                  <FileUploader
                    onUploadComplete={handleImageUpload}
                    maxFiles={1}
                    folder="posts"
                    acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                    maxSizeMB={10}
                  />
                </div>
              )}
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
                    onClick={handleClose}
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
        ) : (
          /* Enhanced Form Step */
          <div className="w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Create Your Post</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <EnhancedCreatePostForm 
              communities={communities}
              onPostCreated={handlePostCreated}
              initialContent={postContent}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;