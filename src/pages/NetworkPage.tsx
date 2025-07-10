import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  UserPlus,
  Filter,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserConnections } from '@/hooks/useUserConnections';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  profession?: string;
  bio?: string;
  hometown_india?: string;
  skills?: string[];
  interests?: string[];
  profile_completion_score?: number;
  experience_years?: number;
}

const NetworkPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendConnectionRequest, getConnectionStatus } = useUserConnections();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, professionFilter, locationFilter]);

  const fetchUsers = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('profile_completion_score', { ascending: false });

      if (error) throw error;

      const usersData = data || [];
      setUsers(usersData);
      
      // Check connection status for each user
      const statuses: Record<string, any> = {};
      for (const profile of usersData) {
        const status = await getConnectionStatus(profile.id);
        statuses[profile.id] = status;
      }
      setConnectionStatuses(statuses);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (professionFilter && professionFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.profession?.toLowerCase().includes(professionFilter.toLowerCase())
      );
    }

    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.hometown_india?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSendConnectionRequest = async (userId: string) => {
    try {
      await sendConnectionRequest(userId, "I'd like to connect with you!");
      
      // Update connection status
      const status = await getConnectionStatus(userId);
      setConnectionStatuses(prev => ({
        ...prev,
        [userId]: status
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const getConnectionButton = (userId: string) => {
    const status = connectionStatuses[userId];
    
    if (!status) {
      return (
        <Button 
          variant="cultural" 
          size="sm"
          onClick={() => handleSendConnectionRequest(userId)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      );
    }

    if (status.status === 'accepted') {
      return (
        <Badge variant="default">
          <Users className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    }

    if (status.status === 'pending') {
      return (
        <Badge variant="secondary">
          {status.isRequester ? 'Request Sent' : 'Request Received'}
        </Badge>
      );
    }

    return null;
  };

  const uniqueProfessions = [...new Set(users.map(u => u.profession).filter(Boolean))];
  const uniqueLocations = [...new Set(users.map(u => u.hometown_india).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Your Network
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow Indians around the world. Build meaningful professional and personal relationships.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Find People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, profession, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {uniqueProfessions.map(profession => (
                    <SelectItem key={profession} value={profession!}>
                      {profession}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location!}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setProfessionFilter('all');
                  setLocationFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found {filteredUsers.length} people
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>
                        {profile.first_name[0]}{profile.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        to={`/profile/${profile.id}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {profile.first_name} {profile.last_name}
                      </Link>
                      {profile.profession && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="w-3 h-3" />
                          {profile.profession}
                        </div>
                      )}
                    </div>
                  </div>
                  {profile.profile_completion_score && profile.profile_completion_score >= 80 && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                <div className="space-y-2">
                  {profile.hometown_india && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {profile.hometown_india}
                    </div>
                  )}
                  
                  {profile.experience_years && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      {profile.experience_years} years experience
                    </div>
                  )}
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Link to={`/profile/${profile.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  {getConnectionButton(profile.id)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters to find more people.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;