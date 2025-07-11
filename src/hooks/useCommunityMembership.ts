import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

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
  const [membership, setMembership] = useState<CommunityMembership | null>(null);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Standardized async operations with consistent error handling
  const joinOperation = useAsyncOperation({
    successMessage: "Successfully joined the community!",
    errorMessage: "Failed to join community. Please try again."
  });
  
  const leaveOperation = useAsyncOperation({
    successMessage: "You've left the community.",
    errorMessage: "Failed to leave community. Please try again."
  });
  
  const cancelRequestOperation = useAsyncOperation({
    successMessage: "Your join request has been cancelled.",
    errorMessage: "Failed to cancel request. Please try again."
  });
  
  const roleUpdateOperation = useAsyncOperation({
    successMessage: "Member role has been updated successfully.",
    errorMessage: "Failed to update member role. Please try again."
  });
  
  const removeMemberOperation = useAsyncOperation({
    successMessage: "Member has been removed from the community.",
    errorMessage: "Failed to remove member. Please try again."
  });

  // Optimized membership status check
  const checkMembershipStatus = useCallback(async () => {
    if (!user || !communityId) {
      setLoading(false);
      return;
    }

    try {
      // Optimize: Check both membership and join request in parallel
      const [
        { data: memberData, error: memberError },
        { data: requestData, error: requestError }
      ] = await Promise.all([
        supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('community_join_requests')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .maybeSingle()
      ]);

      if (memberError) {
        console.error('Error fetching membership:', memberError);
      } else {
        setMembership(memberData);
      }

      // Only set join request if user is not a member
      if (requestError) {
        console.error('Error fetching join request:', requestError);
      } else if (!memberData) {
        setJoinRequest(requestData);
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
    } finally {
      setLoading(false);
    }
  }, [user, communityId]);

  useEffect(() => {
    checkMembershipStatus();
  }, [checkMembershipStatus]);

  const joinCommunity = useCallback(async (message?: string) => {
    if (!user || !communityId) return;

    return joinOperation.execute(async () => {
      // Get community details to check if approval is required
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('require_approval, auto_approve_members')
        .eq('id', communityId)
        .single();

      if (communityError || !community) {
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

        // Refresh membership status
        const { data: newMembership } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .eq('user_id', user.id)
          .single();

        setMembership(newMembership);
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('communityJoined', { 
          detail: { communityId } 
        }));
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
    });
  }, [user, communityId, joinOperation]);

  const leaveCommunity = useCallback(async () => {
    if (!user || !membership) return;

    return leaveOperation.execute(async () => {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;
      setMembership(null);
    });
  }, [user, membership, communityId, leaveOperation]);

  const cancelJoinRequest = useCallback(async () => {
    if (!user || !joinRequest) return;

    return cancelRequestOperation.execute(async () => {
      const { error } = await supabase
        .from('community_join_requests')
        .delete()
        .eq('id', joinRequest.id);

      if (error) throw error;
      setJoinRequest(null);
    });
  }, [user, joinRequest, cancelRequestOperation]);

  const updateMemberRole = useCallback(async (userId: string, newRole: string) => {
    if (!user || !membership) return;

    return roleUpdateOperation.execute(async () => {
      const { error } = await supabase
        .from('community_members')
        .update({ role: newRole })
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    });
  }, [user, membership, communityId, roleUpdateOperation]);

  const removeMember = useCallback(async (userId: string) => {
    if (!user || !membership) return;

    return removeMemberOperation.execute(async () => {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    });
  }, [user, membership, communityId, removeMemberOperation]);

  // Computed values
  const canModerate = membership?.role === 'owner' || membership?.role === 'admin' || membership?.role === 'moderator';
  const canManageRoles = membership?.role === 'owner' || membership?.role === 'admin';
  const userRole = membership?.role || 'none';

  return {
    // State
    membership,
    joinRequest,
    loading,
    isMember: !!membership,
    hasPendingRequest: !!joinRequest,
    canModerate,
    canManageRoles,
    userRole,
    
    // Loading states for individual operations
    isLoading: loading,
    joining: joinOperation.loading,
    leaving: leaveOperation.loading,
    cancelingRequest: cancelRequestOperation.loading,
    updatingRole: roleUpdateOperation.loading,
    removingMember: removeMemberOperation.loading,
    
    // Actions
    joinCommunity,
    leaveCommunity,
    cancelJoinRequest,
    updateMemberRole,
    removeMember,
    refreshMembership: checkMembershipStatus
  };
};