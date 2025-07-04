import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import SearchBar from "./SearchBar";
import LiveChat from "./LiveChat";
import MobileNav from "./MobileNav";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <>
      <MobileNav />
      <header className="hidden md:block border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center text-white font-bold text-xl">
                म
              </div>
              <span className="text-2xl font-bold text-foreground">Mohallaa</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>

            {/* Navigation & Auth */}
            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link to="/communities" className="text-foreground hover:text-primary transition-colors font-medium">
                  Communities
                </Link>
                <Link to="/posts" className="text-foreground hover:text-primary transition-colors font-medium">
                  Posts
                </Link>
                {user && (
                  <>
                    <Link to="/network" className="text-foreground hover:text-primary transition-colors font-medium">
                      Network
                    </Link>
                    <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>

              {user ? (
                <div className="flex items-center space-x-3">
                  <NotificationCenter />
                  <Button onClick={signOut} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild variant="cultural" size="sm">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {user && <LiveChat />}
    </>
  );
};

export default Header;