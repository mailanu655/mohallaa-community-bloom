import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Clock, MessageCircle } from 'lucide-react';
import { useUserConnections } from '@/hooks/useUserConnections';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ConnectButtonProps {
  userId: string;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ userId }) => {
  const { user } = useAuth();
  const { sendConnectionRequest, getConnectionStatus } = useUserConnections();
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && userId !== user.id) {
      checkConnectionStatus();
    }
  }, [user, userId]);

  const checkConnectionStatus = async () => {
    const status = await getConnectionStatus(userId);
    setConnectionStatus(status);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await sendConnectionRequest(userId, "I'd like to connect with you!");
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show connect button for own profile
  if (!user || userId === user.id) {
    return null;
  }

  // Show different states based on connection status
  if (!connectionStatus) {
    return (
      <Button 
        variant="cultural" 
        onClick={handleConnect}
        disabled={isLoading}
        className="gap-2"
      >
        <UserPlus className="w-4 h-4" />
        {isLoading ? 'Connecting...' : 'Connect'}
      </Button>
    );
  }

  if (connectionStatus.status === 'accepted') {
    return (
      <div className="flex gap-2">
        <Badge variant="default" className="gap-1">
          <Users className="w-3 h-3" />
          Connected
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/messages/${userId}`}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </Link>
        </Button>
      </div>
    );
  }

  if (connectionStatus.status === 'pending') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        {connectionStatus.isRequester ? 'Request Sent' : 'Request Received'}
      </Badge>
    );
  }

  // Declined or other states - show connect button again
  return (
    <Button 
      variant="cultural" 
      onClick={handleConnect}
      disabled={isLoading}
      className="gap-2"
    >
      <UserPlus className="w-4 h-4" />
      {isLoading ? 'Connecting...' : 'Connect'}
    </Button>
  );
};

export default ConnectButton;