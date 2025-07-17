import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Users,
  Calendar,
  ShoppingBag,
  Bookmark,
  Plus,
} from 'lucide-react';

interface NavigationSidebarProps {
  onCreatePost?: () => void;
}

const NavigationSidebar = ({ onCreatePost }: NavigationSidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden lg:block border-r border-border/50 p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Mohallaa</h2>
        
        <nav className="space-y-2">
          <Button 
            variant={isActive('/home') ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            asChild
          >
            <Link to="/home">
              <TrendingUp className="w-5 h-5 mr-3" />
              Home
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/communities') ? 'default' : 'ghost'}
            className="w-full justify-start" 
            asChild
          >
            <Link to="/communities">
              <Users className="w-5 h-5 mr-3" />
              Communities
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/events') ? 'default' : 'ghost'}
            className="w-full justify-start" 
            asChild
          >
            <Link to="/events">
              <Calendar className="w-5 h-5 mr-3" />
              Events
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/marketplace') ? 'default' : 'ghost'}
            className="w-full justify-start" 
            asChild
          >
            <Link to="/marketplace">
              <ShoppingBag className="w-5 h-5 mr-3" />
              Marketplace
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/businesses') ? 'default' : 'ghost'}
            className="w-full justify-start" 
            asChild
          >
            <Link to="/businesses">
              <Users className="w-5 h-5 mr-3" />
              Businesses
            </Link>
          </Button>
          
          <Button 
            variant={isActive('/bookmarks') ? 'default' : 'ghost'}
            className="w-full justify-start" 
            asChild
          >
            <Link to="/bookmarks">
              <Bookmark className="w-5 h-5 mr-3" />
              Bookmarks
            </Link>
          </Button>
        </nav>
      </div>

      {onCreatePost && (
        <Button 
          className="w-full" 
          onClick={onCreatePost}
        >
          <Plus className="w-4 h-4 mr-2" />
          Post
        </Button>
      )}
    </div>
  );
};

export default NavigationSidebar;