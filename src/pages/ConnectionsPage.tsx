import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { useUserConnections } from '@/hooks/useUserConnections';
import UserConnectionCard from '@/components/UserConnectionCard';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const ConnectionsPage = () => {
  const { user } = useAuth();
  const { 
    connections, 
    pendingRequests, 
    sentRequests, 
    isLoading, 
    refreshConnections 
  } = useUserConnections();

  const [enrichedPendingRequests, setEnrichedPendingRequests] = useState([]);
  const [enrichedSentRequests, setEnrichedSentRequests] = useState([]);
  const [enrichedConnections, setEnrichedConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading) {
      enrichConnectionsWithProfiles();
    }
  }, [connections, pendingRequests, sentRequests, isLoading]);

  const enrichConnectionsWithProfiles = async () => {
    try {
      // Get all unique user IDs
      const allConnections = [...connections, ...pendingRequests, ...sentRequests];
      const userIds = new Set<string>();
      
      allConnections.forEach(conn => {
        if (conn.requester_id) userIds.add(conn.requester_id);
        if (conn.addressee_id) userIds.add(conn.addressee_id);
      });

      if (userIds.size === 0) return;

      // Fetch all profiles at once
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, profession')
        .in('id', Array.from(userIds));

      if (error) throw error;

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      // Enrich each connection type
      const enrichPending = pendingRequests.map(conn => ({
        ...conn,
        requester: profileMap[conn.requester_id],
        addressee: profileMap[conn.addressee_id]
      }));

      const enrichSent = sentRequests.map(conn => ({
        ...conn,
        requester: profileMap[conn.requester_id],
        addressee: profileMap[conn.addressee_id]
      }));

      const enrichAccepted = connections.map(conn => ({
        ...conn,
        requester: profileMap[conn.requester_id],
        addressee: profileMap[conn.addressee_id]
      }));

      setEnrichedPendingRequests(enrichPending);
      setEnrichedSentRequests(enrichSent);
      setEnrichedConnections(enrichAccepted);
    } catch (error) {
      console.error('Error enriching connections:', error);
    }
  };

  const filterConnections = (connections) => {
    if (!searchTerm) return connections;
    
    return connections.filter(conn => {
      const otherUser = conn.requester_id === user?.id ? conn.addressee : conn.requester;
      if (!otherUser) return false;
      
      const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
      const profession = otherUser.profession?.toLowerCase() || '';
      
      return fullName.includes(searchTerm.toLowerCase()) || 
             profession.includes(searchTerm.toLowerCase());
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Connections
            </h1>
            <p className="text-muted-foreground">
              Manage your professional network and connection requests
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={refreshConnections}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{connections.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Connected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold">{pendingRequests.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">{sentRequests.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Sent Requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Connection Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 text-xs">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">
              My Connections
              <Badge variant="secondary" className="ml-2 h-5 w-5 text-xs">
                {connections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Requests
              {sentRequests.length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 w-5 text-xs">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Connection Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterConnections(enrichedPendingRequests).length > 0 ? (
                  <div className="space-y-4">
                    {filterConnections(enrichedPendingRequests).map((request) => (
                      <UserConnectionCard
                        key={request.id}
                        connection={request}
                        currentUserId={user?.id || ''}
                        type="received"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No requests match your search.' : 'You don\'t have any pending connection requests.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Network ({connections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterConnections(enrichedConnections).length > 0 ? (
                  <div className="space-y-4">
                    {filterConnections(enrichedConnections).map((connection) => (
                      <UserConnectionCard
                        key={connection.id}
                        connection={connection}
                        currentUserId={user?.id || ''}
                        type="accepted"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No connections yet</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No connections match your search.' : 'Start building your network by connecting with other professionals.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sent Requests Tab */}
          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Sent Requests ({sentRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterConnections(enrichedSentRequests).length > 0 ? (
                  <div className="space-y-4">
                    {filterConnections(enrichedSentRequests).map((request) => (
                      <UserConnectionCard
                        key={request.id}
                        connection={request}
                        currentUserId={user?.id || ''}
                        type="sent"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No sent requests</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No sent requests match your search.' : 'You haven\'t sent any connection requests yet.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectionsPage;