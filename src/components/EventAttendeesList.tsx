import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Star } from 'lucide-react';
import { useEventRSVP } from '@/hooks/useEventRSVP';

interface EventAttendeesListProps {
  eventId: string;
  maxDisplayed?: number;
}

const EventAttendeesList = ({ eventId, maxDisplayed = 3 }: EventAttendeesListProps) => {
  const { 
    attendees, 
    attendingCount, 
    interestedCount, 
    maybeCount, 
    loading 
  } = useEventRSVP(eventId);
  
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-muted rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const attendingMembers = attendees.filter(a => a.status === 'attending');
  const interestedMembers = attendees.filter(a => a.status === 'interested');
  const maybeMembers = attendees.filter(a => a.status === 'maybe');

  const displayedAttending = attendingMembers.slice(0, maxDisplayed);
  const hasMore = attendingMembers.length > maxDisplayed;

  return (
    <div className="space-y-3">
      {/* Attendee Counts */}
      <div className="flex items-center gap-4 text-sm">
        {attendingCount > 0 && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="font-medium">{attendingCount}</span>
            <span className="text-muted-foreground">attending</span>
          </div>
        )}
        {interestedCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">{interestedCount}</span>
            <span className="text-muted-foreground">interested</span>
          </div>
        )}
        {maybeCount > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{maybeCount}</span>
            <span className="text-muted-foreground">maybe</span>
          </div>
        )}
      </div>

      {/* Attendee Avatars */}
      {attendingMembers.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {displayedAttending.map((attendee) => (
              <Avatar 
                key={attendee.id} 
                className="w-8 h-8 border-2 border-background"
                title={`${attendee.profiles?.first_name} ${attendee.profiles?.last_name}`}
              >
                <AvatarImage src={attendee.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {attendee.profiles?.first_name?.[0]}{attendee.profiles?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          
          {hasMore && (
            <Dialog open={showAllAttendees} onOpenChange={setShowAllAttendees}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs px-2 h-8">
                  +{attendingMembers.length - maxDisplayed} more
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Event Attendees</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {/* Attending */}
                    {attendingMembers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Attending ({attendingCount})</span>
                        </div>
                        <div className="space-y-2">
                          {attendingMembers.map((attendee) => (
                            <div key={attendee.id} className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={attendee.profiles?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {attendee.profiles?.first_name?.[0]}{attendee.profiles?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {attendee.profiles?.first_name} {attendee.profiles?.last_name}
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                <Calendar className="w-3 h-3 mr-1" />
                                Attending
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interested */}
                    {interestedMembers.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">Interested ({interestedCount})</span>
                          </div>
                          <div className="space-y-2">
                            {interestedMembers.map((attendee) => (
                              <div key={attendee.id} className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={attendee.profiles?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {attendee.profiles?.first_name?.[0]}{attendee.profiles?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {attendee.profiles?.first_name} {attendee.profiles?.last_name}
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                  <Star className="w-3 h-3 mr-1" />
                                  Interested
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Maybe */}
                    {maybeMembers.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Maybe ({maybeCount})</span>
                          </div>
                          <div className="space-y-2">
                            {maybeMembers.map((attendee) => (
                              <div key={attendee.id} className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={attendee.profiles?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {attendee.profiles?.first_name?.[0]}{attendee.profiles?.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {attendee.profiles?.first_name} {attendee.profiles?.last_name}
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                  <Users className="w-3 h-3 mr-1" />
                                  Maybe
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default EventAttendeesList;