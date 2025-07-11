import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommunityMembership {
  id: string;
  user_id: string;
  community_id: string;
  role: string;
  joined_at: string;
}

export interface JoinRequest {
  id: string;
  user_id: string;
  community_id: string;
  status: string;
  message: string | null;
  created_at: string;
}

export const useCommunityMembership = (communityId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [membership, setMembership] = useState<CommunityMembership | null>(null);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Check existing membership and join request
  useEffect(() => {
    if (!user || !communityId) {
      setLoading(false);
      return;
    }

    const checkMembershipStatus = async () => {
      try {
        // Check if user is already a member
        const { data: memberData } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .maybeSingle();

        setMembership(memberData);

        // If not a member, check for pending join request
        if (!memberData) {
          const { data: requestData } = await supabase
            .from('community_join_requests')
            .select('*')
            .eq('community_id', communityId)
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          setJoinRequest(requestData);
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMembershipStatus();
  }, [user, communityId]);

  const joinCommunity = async (message?: string) => {
    if (!user || !communityId) return;

    setJoining(true);
    try {
      // Get community details to check if approval is required
      const { data: community } = await supabase
        .from('communities')
        .select('require_approval, auto_approve_members')
        .eq('id', communityId)
        .single();

      if (!community) {
        throw new Error('Community not found');
      }

      // If auto-approve is enabled, directly add to members
      if (community.auto_approve_members && !community.require_approval) {
        const { error } = await supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: user.id,
            role: 'member'
          });

        if (error) throw error;

        toast({
          title: "Welcome!",
          description: "You've successfully joined the community.",
        });

        // Refresh membership status
        const { data: newMembership } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .single();

        setMembership(newMembership);
      } else {
        // Create join request for approval
        const { error } = await supabase
          .from('community_join_requests')
          .insert({
            community_id: communityId,
            user_id: user.id,
            message: message || null,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: "Request Sent",
          description: "Your join request has been sent for approval.",
        });

        // Refresh join request status
        const { data: newRequest } = await supabase
          .from('community_join_requests')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .single();

        setJoinRequest(newRequest);
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const leaveCommunity = async () => {
    if (!user || !membership) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left Community",
        description: "You've left the community.",
      });

      setMembership(null);
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelJoinRequest = async () => {
    if (!user || !joinRequest) return;

    try {
      const { error } = await supabase
        .from('community_join_requests')
        .delete()
        .eq('id', joinRequest.id);

      if (error) throw error;

      toast({
        title: "Request Cancelled",
        description: "Your join request has been cancelled.",
      });

      setJoinRequest(null);
    } catch (error) {
      console.error('Error cancelling join request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    if (!user || !membership) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (userId: string) => {
    if (!user || !membership) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Member has been removed from the community.",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canModerate = membership?.role === 'owner' || membership?.role === 'admin' || membership?.role === 'moderator';
  const canManageRoles = membership?.role === 'owner' || membership?.role === 'admin';
  const userRole = membership?.role || 'none';

  return {
    membership,
    joinRequest,
    loading,
    joining,
    isMember: !!membership,
    hasPendingRequest: !!joinRequest,
    canModerate,
    canManageRoles,
    userRole,
    isLoading: loading,
    joinCommunity,
    leaveCommunity,
    cancelJoinRequest,
    updateMemberRole,
    removeMember
  };
};