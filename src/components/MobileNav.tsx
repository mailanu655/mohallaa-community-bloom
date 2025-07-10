import { useState } from 'react';
import { Menu, X, Home, Users, MessageSquare, Calendar, User, Search, ShoppingBag, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from './NotificationCenter';
import SearchBar from './SearchBar';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Communities', href: '/communities', icon: Users },
    { name: 'Buy & Sell', href: '/marketplace', icon: ShoppingBag },
    { name: 'Businesses', href: '/businesses', icon: Building2 },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Dashboard', href: '/dashboard', icon: User, requireAuth: true },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center text-white font-bold">
                          म
                        </div>
                        <span className="text-lg font-bold text-foreground">Mohallaa</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="p-2"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigation.map((item) => {
                        if (item.requireAuth && !user) return null;
                        
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* User Section */}
                  <div className="p-4 border-t border-border">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">Signed in</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={signOut}
                          className="w-full"
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link to="/auth" onClick={() => setIsOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-hero rounded-lg flex items-center justify-center text-white font-bold text-sm">
                म
              </div>
              <span className="text-lg font-bold text-foreground">Mohallaa</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <div className="relative">
                <NotificationCenter />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => {
                // Could open search modal or navigate to search page
              }}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar for Mobile */}
        <div className="px-4 pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            if (item.requireAuth && !user) return null;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.name === 'Posts' && unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
          
          {user && (
            <Link
              to="/profile"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNav;