import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown, Loader2, Users, X } from 'lucide-react';
import { useEventRSVP } from '@/hooks/useEventRSVP';
import { useAuth } from '@/contexts/AuthContext';

interface EventRSVPButtonProps {
  eventId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showAttendeeCount?: boolean;
}

const EventRSVPButton = ({ 
  eventId, 
  variant = 'default', 
  size = 'default',
  showAttendeeCount = false 
}: EventRSVPButtonProps) => {
  const { user } = useAuth();
  const { 
    userRSVP, 
    attendingCount, 
    updating, 
    hasRSVP, 
    isAttending,
    isInterested,
    isMaybe,
    rsvpToEvent, 
    cancelRSVP 
  } = useEventRSVP(eventId);
  
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return null;
  }

  const getStatusText = () => {
    if (isAttending) return 'Attending';
    if (isInterested) return 'Interested';
    if (isMaybe) return 'Maybe';
    return 'RSVP';
  };

  const getStatusIcon = () => {
    if (isAttending) return <Calendar className="w-4 h-4" />;
    if (isInterested) return <Users className="w-4 h-4" />;
    if (isMaybe) return <Users className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getVariant = () => {
    if (hasRSVP) return 'outline';
    return variant;
  };

  if (hasRSVP) {
    return (
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={getVariant()} 
            size={size}
            disabled={updating}
            className="flex items-center gap-2"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              getStatusIcon()
            )}
            {getStatusText()}
            {showAttendeeCount && attendingCount > 0 && (
              <span className="text-xs">({attendingCount})</span>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => rsvpToEvent('attending')}
            disabled={updating}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Attending
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => rsvpToEvent('interested')}
            disabled={updating}
          >
            <Users className="w-4 h-4 mr-2" />
            Interested
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => rsvpToEvent('maybe')}
            disabled={updating}
          >
            <Users className="w-4 h-4 mr-2" />
            Maybe
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={cancelRSVP}
            disabled={updating}
            className="text-destructive focus:text-destructive"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel RSVP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={updating}
          className="flex items-center gap-2"
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          RSVP
          {showAttendeeCount && attendingCount > 0 && (
            <span className="text-xs">({attendingCount})</span>
          )}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => rsvpToEvent('attending')}
          disabled={updating}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Attending
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => rsvpToEvent('interested')}
          disabled={updating}
        >
          <Users className="w-4 h-4 mr-2" />
          Interested
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => rsvpToEvent('maybe')}
          disabled={updating}
        >
          <Users className="w-4 h-4 mr-2" />
          Maybe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventRSVPButton;