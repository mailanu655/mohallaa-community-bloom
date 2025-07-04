import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  MessageCircle, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { useUserConnections } from '@/hooks/useUserConnections';

interface UserConnectionCardProps {
  connection: {
    id: string;
    requester_id: string;
    addressee_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    message?: string;
    created_at: string;
    requester?: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
      profession?: string;
    };
    addressee?: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
      profession?: string;
    };
  };
  currentUserId: string;
  type: 'received' | 'sent' | 'accepted';
}

const UserConnectionCard: React.FC<UserConnectionCardProps> = ({
  connection,
  currentUserId,
  type
}) => {
  const { respondToConnection, removeConnection } = useUserConnections();
  const [isUpdating, setIsUpdating] = useState(false);

  // Determine which profile to show
  const otherUser = connection.requester_id === currentUserId 
    ? connection.addressee 
    : connection.requester;

  if (!otherUser) return null;

  const handleAccept = async () => {
    setIsUpdating(true);
    await respondToConnection(connection.id, 'accepted');
    setIsUpdating(false);
  };

  const handleDecline = async () => {
    setIsUpdating(true);
    await respondToConnection(connection.id, 'declined');
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this connection?')) {
      setIsUpdating(true);
      await removeConnection(connection.id);
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (connection.status) {
      case 'accepted':
        return <Badge variant="default" className="text-xs">Connected</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="text-xs">Declined</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (connection.status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-cultural transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback>
                {otherUser.first_name?.[0]}{otherUser.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {otherUser.first_name} {otherUser.last_name}
                </h3>
                {getStatusIcon()}
              </div>
              {otherUser.profession && (
                <p className="text-sm text-muted-foreground">{otherUser.profession}</p>
              )}
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <span className="text-xs text-muted-foreground">
                  {new Date(connection.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {type === 'received' && connection.status === 'pending' && (
              <>
                <Button
                  variant="cultural"
                  size="sm"
                  onClick={handleAccept}
                  disabled={isUpdating}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  disabled={isUpdating}
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </>
            )}

            {type === 'accepted' && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/messages/${otherUser.id}`}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/profile/${otherUser.id}`}>
                    View Profile
                  </Link>
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${otherUser.id}`}>
                    View Profile
                  </Link>
                </DropdownMenuItem>
                {connection.status === 'accepted' && (
                  <DropdownMenuItem 
                    onClick={handleRemove}
                    className="text-destructive focus:text-destructive"
                  >
                    Remove Connection
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {connection.message && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Message:</strong> {connection.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserConnectionCard;