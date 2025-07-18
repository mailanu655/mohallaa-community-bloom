
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Plus, LogOut, User, RefreshCw } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";

const ProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [hasBusinessAccess, setHasBusinessAccess] = useState(false);
  const { location, loading: locationLoading, requestLocation } = useLocation();

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkBusinessAccess();
    }
  }, [user]);

  // Refetch profile when location changes
  useEffect(() => {
    if (user && location) {
      fetchProfile();
    }
  }, [user, location]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, current_address, current_city, current_state, current_latitude, current_longitude')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkBusinessAccess = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);
      
      setHasBusinessAccess(data && data.length > 0);
    } catch (error) {
      console.error('Error checking business access:', error);
    }
  };

  const handleLocationRefresh = async () => {
    await requestLocation();
  };

  const getUserInitial = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getLocation = () => {
    // Use the most recent location data from useLocation hook first
    if (location?.city && location?.state) {
      return `${location.city}, ${location.state}`;
    }
    
    // Fall back to profile data
    if (profile?.current_city && profile?.current_state) {
      return `${profile.current_city}, ${profile.current_state}`;
    }
    
    // Fall back to current_address if available
    if (profile?.current_address) {
      return profile.current_address;
    }
    
    return 'Location not set';
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-sm font-bold">
              {getUserInitial()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4 bg-background border border-border shadow-lg" align="end">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-3 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {getUserInitial()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg text-foreground">
              {getDisplayName()}
            </h3>
            <div className="flex items-center justify-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{getLocation()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-1 hover:bg-muted"
                onClick={handleLocationRefresh}
                disabled={locationLoading}
                title="Refresh location"
              >
                <RefreshCw className={`w-3 h-3 ${locationLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/profile/${user?.id}`}>
              <User className="w-4 h-4 mr-2" />
              View profile
            </Link>
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <div className="space-y-1 py-2">
          {!hasBusinessAccess && (
            <DropdownMenuItem asChild>
              <Link to="/register-business" className="flex items-center w-full">
                <Plus className="w-4 h-4 mr-3" />
                Add business page
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={signOut}
            className="flex items-center w-full text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
