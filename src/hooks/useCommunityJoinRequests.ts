import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCommunityJoinRequests = (communityId: string) => {
  const { user } = useAuth();
  const [joinRequests, setJoinRequests] = useState([]);
  const [userJoinRequest, setUserJoinRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch join requests for moderators
  const fetchJoinRequests = async () => {
    if (!user || !communityId) return;

    try {
      const { data, error } = await supabase
        .from('community_join_requests')
        .select(`
          *,
          profiles!inner(first_name, last_name, avatar_url)
        `)
        .eq('community_id', communityId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  // Fetch user's own join request status
  const fetchUserJoinRequest = async () => {
    if (!user || !communityId) return;

    try {
      const { data, error } = await supabase
        .from('community_join_requests')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserJoinRequest(data);
    } catch (error) {
      console.error('Error fetching user join request:', error);
    }
  };

  // Submit join request
  const submitJoinRequest = async (message?: string) => {
    if (!user || !communityId) return false;

    setIsLoading(true);
    try {
      // First ensure user has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || ''
          });

        if (profileError) throw profileError;
      }

      const { error } = await supabase
        .from('community_join_requests')
        .insert({
          community_id: communityId,
          user_id: user.id,
          message: message || null
        });

      if (error) throw error;

      toast.success('Join request submitted successfully!');
      await fetchUserJoinRequest();
      return true;
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to submit join request');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Approve join request
  const approveJoinRequest = async (requestId: string, userId: string) => {
    setIsLoading(true);
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('community_join_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add user to community
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          role: 'member'
        });

      if (memberError) throw memberError;

      toast.success('Join request approved!');
      await fetchJoinRequests();
    } catch (error) {
      console.error('Error approving join request:', error);
      toast.error('Failed to approve join request');
    } finally {
      setIsLoading(false);
    }
  };

  // Deny join request
  const denyJoinRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('community_join_requests')
        .update({
          status: 'denied',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Join request denied');
      await fetchJoinRequests();
    } catch (error) {
      console.error('Error denying join request:', error);
      toast.error('Failed to deny join request');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchJoinRequests();
      fetchUserJoinRequest();
    }
  }, [communityId, user]);

  return {
    joinRequests,
    userJoinRequest,
    isLoading,
    submitJoinRequest,
    approveJoinRequest,
    denyJoinRequest,
    refetchRequests: fetchJoinRequests
  };
};