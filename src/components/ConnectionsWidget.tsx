import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  MessageSquare,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ConnectionsWidget = () => {
  const [connections, setConnections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      // TODO: Implement user connections system
      // For now, showing mock data to demonstrate the concept
      const mockConnections = [
        {
          id: '1',
          first_name: 'Priya',
          last_name: 'Sharma',
          avatar_url: null,
          location: 'Downtown',
          last_active: new Date().toISOString(),
          mutual_connections: 5
        },
        {
          id: '2',
          first_name: 'Raj',
          last_name: 'Patel',
          avatar_url: null,
          location: 'Midtown',
          last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          mutual_connections: 3
        }
      ];

      const mockActivity = [
        {
          id: '1',
          user: mockConnections[0],
          action: 'posted in',
          target: 'Indian Cooking Tips',
          time: '2 hours ago'
        },
        {
          id: '2',
          user: mockConnections[1],
          action: 'commented on',
          target: 'Local Restaurant Review',
          time: '4 hours ago'
        }
      ];

      setConnections(mockConnections);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-lg">Connections</span>
          </div>
          <Button variant="ghost" size="sm">
            <UserPlus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Connections */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Active neighbors</h4>
          {connections.map((connection) => (
            <div key={connection.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={connection.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {connection.first_name[0]}{connection.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    to={`/profile/${connection.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {connection.first_name} {connection.last_name}
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {connection.location}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium text-foreground">Recent activity</h4>
          {recentActivity.map((activity) => (
            <div key={activity.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {activity.user.first_name}
              </span>{' '}
              {activity.action}{' '}
              <span className="font-medium text-foreground">{activity.target}</span>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/connections">
            View All Connections
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionsWidget;