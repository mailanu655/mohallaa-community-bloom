import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EventAttendee {
  id: string;
  attendee_id: string;
  event_id: string;
  status: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export const useEventRSVP = (eventId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRSVP, setUserRSVP] = useState<EventAttendee | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch RSVP status and attendees
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchRSVPData = async () => {
      try {
        // Fetch all attendees with their profiles
        const { data: attendeesData } = await supabase
          .from('event_attendees')
          .select(`
            *,
            profiles!inner(first_name, last_name, avatar_url)
          `)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        setAttendees(attendeesData || []);

        // Find current user's RSVP if logged in
        if (user && attendeesData) {
          const userAttendance = attendeesData.find(
            attendee => attendee.attendee_id === user.id
          );
          setUserRSVP(userAttendance || null);
        }
      } catch (error) {
        console.error('Error fetching RSVP data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPData();
  }, [eventId, user]);

  const rsvpToEvent = async (status: string = 'attending') => {
    if (!user || !eventId) return;

    setUpdating(true);
    try {
      if (userRSVP) {
        // Update existing RSVP
        const { error } = await supabase
          .from('event_attendees')
          .update({ status })
          .eq('id', userRSVP.id);

        if (error) throw error;

        // Update local state
        const updatedRSVP = { ...userRSVP, status };
        setUserRSVP(updatedRSVP);
        setAttendees(attendees.map(a => 
          a.id === userRSVP.id ? updatedRSVP : a
        ));

        toast({
          title: "RSVP Updated",
          description: `You're now marked as ${status} for this event.`,
        });
      } else {
        // Create new RSVP
        const { data, error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            attendee_id: user.id,
            status
          })
          .select(`
            *,
            profiles!inner(first_name, last_name, avatar_url)
          `)
          .single();

        if (error) throw error;

        setUserRSVP(data);
        setAttendees([data, ...attendees]);

        toast({
          title: "RSVP Confirmed",
          description: `You're now registered for this event!`,
        });
      }

      // Update event attendee count
      await updateEventAttendeeCount();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const cancelRSVP = async () => {
    if (!user || !userRSVP) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('id', userRSVP.id);

      if (error) throw error;

      setUserRSVP(null);
      setAttendees(attendees.filter(a => a.id !== userRSVP.id));

      toast({
        title: "RSVP Cancelled",
        description: "You've been removed from this event.",
      });

      // Update event attendee count
      await updateEventAttendeeCount();
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to cancel RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateEventAttendeeCount = async () => {
    try {
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'attending');

      // Update the events table with current attendee count
      await supabase
        .from('events')
        .update({ current_attendees: count || 0 })
        .eq('id', eventId);
    } catch (error) {
      console.error('Error updating attendee count:', error);
    }
  };

  const attendingCount = attendees.filter(a => a.status === 'attending').length;
  const interestedCount = attendees.filter(a => a.status === 'interested').length;
  const maybeCount = attendees.filter(a => a.status === 'maybe').length;

  return {
    userRSVP,
    attendees,
    attendingCount,
    interestedCount,
    maybeCount,
    loading,
    updating,
    isAttending: userRSVP?.status === 'attending',
    isInterested: userRSVP?.status === 'interested',
    isMaybe: userRSVP?.status === 'maybe',
    hasRSVP: !!userRSVP,
    rsvpToEvent,
    cancelRSVP
  };
};