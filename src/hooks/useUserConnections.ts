import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  message?: string;
  created_at: string;
  updated_at: string;
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
}

export const useUserConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserConnection[]>([]);
  const [sentRequests, setSentRequests] = useState<UserConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('user_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Fetch pending connection requests (received)
      const { data: pendingData, error: pendingError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch sent connection requests
      const { data: sentData, error: sentError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setConnections((connectionsData || []) as UserConnection[]);
      setPendingRequests((pendingData || []) as UserConnection[]);
      setSentRequests((sentData || []) as UserConnection[]);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load connections. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendConnectionRequest = async (userId: string, message?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully."
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .update({ status })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Connection Accepted" : "Connection Declined",
        description: `You have ${status} the connection request.`
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error responding to connection:', error);
      toast({
        title: "Error",
        description: "Failed to respond to connection request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection Removed",
        description: "The connection has been removed successfully."
      });

      await fetchConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getConnectionStatus = async (userId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('status, requester_id')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        status: data.status,
        isRequester: data.requester_id === user.id
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return null;
    }
  };

  return {
    connections,
    pendingRequests,
    sentRequests,
    isLoading,
    sendConnectionRequest,
    respondToConnection,
    removeConnection,
    getConnectionStatus,
    refreshConnections: fetchConnections
  };
};